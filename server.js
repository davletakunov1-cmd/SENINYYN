import 'dotenv/config';
import express from 'express';
import { Telegraf } from 'telegraf';
import crypto from 'crypto';
import cors from 'cors';

// Поддерживаем оба варианта названия переменной
const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ Ошибка: BOT_TOKEN или TELEGRAM_BOT_TOKEN не задан в .env файле');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(cors());

const userPhones = new Map();

// --- 1. ЛОГИКА ТЕЛЕГРАМ-БОТА ---

bot.start((ctx) => {
  ctx.reply(
    'Добро пожаловать! Чтобы публиковать объявления без спама, пожалуйста, подтвердите ваш номер телефона.',
    {
      reply_markup: {
        keyboard: [
          [{ text: '📱 Подтвердить номер телефона', request_contact: true }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    }
  );
});

bot.on('contact', (ctx) => {
  const userId = ctx.from.id;
  const phoneNumber = ctx.message.contact.phone_number;

  userPhones.set(userId, phoneNumber);

  ctx.reply('Спасибо! Номер успешно подтвержден. Теперь вы можете вернуться в приложение и создать объявление.', {
    reply_markup: { remove_keyboard: true }
  });
});

bot.launch();
console.log('🤖 Telegram-бот запущен');

// --- 2. БЭКЕНД API ДЛЯ РЕАКТ-ПРИЛОЖЕНИЯ ---

function verifyTelegramInitData(initDataString, botToken) {
  try {
    const urlParams = new URLSearchParams(initDataString);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => `${key}=${val}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash === hash) {
      const userParam = urlParams.get('user');
      return userParam ? JSON.parse(userParam) : null;
    }
    return null;
  } catch (e) {
    return null;
  }
}

app.get('/api/get-phone', (req, res) => {
  const initData = req.headers['x-telegram-init-data'];
  
  const user = verifyTelegramInitData(initData, BOT_TOKEN);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const phone = userPhones.get(user.id);

  if (!phone) {
    return res.json({ verified: false });
  }

  res.json({ verified: true, phone });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Бэкенд сервер запущен на порту ${PORT}`);
});