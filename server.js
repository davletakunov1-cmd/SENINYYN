import 'dotenv/config';
import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import crypto from 'crypto';
import cors from 'cors';
import fs from 'fs';

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const DB_FILE = './user_phones.json';

if (!BOT_TOKEN) {
  console.error('❌ Ошибка: BOT_TOKEN не задан в .env файле');
  process.exit(1);
}

// Загрузка базы данных из файла
let userPhones = {};
if (fs.existsSync(DB_FILE)) {
  try {
    userPhones = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    console.error('Ошибка чтения user_phones.json:', e);
    userPhones = {};
  }
}

const saveData = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(userPhones, null, 2));
};

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(cors());

// --- ЛОГИКА ТЕЛЕГРАМ-БОТА ---

// Функция отображения статуса пользователю
const sendUserStatus = (ctx) => {
  const userId = ctx.from.id.toString();
  const existingPhone = userPhones[userId];

  if (existingPhone) {
    // Пользователь уже подтвержден — показываем статус и inline-кнопку для смены
    ctx.reply(
      `✅ Ваш номер **${existingPhone}** уже подтвержден!\n\nВы можете свободно публиковать объявления в мини-приложении.`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          remove_keyboard: true // Убираем обычную клавиатуру снизу
        }
      }
    );
    
    // Дополнительно отправляем аккуратную инлайн-кнопку
    ctx.reply(
      'Хотите привязать другой номер?',
      Markup.inlineKeyboard([
        Markup.button.callback('🔄 Сменить номер', 'change_phone')
      ])
    );
  } else {
    // Пользователь еще НЕ подтвержден — запрашиваем контакт
    ctx.reply(
      'Добро пожаловать! Чтобы публиковать объявления без спама, пожалуйста, подтвердите ваш номер телефона.',
      Markup.keyboard([
        [Markup.button.contactRequest('📱 Подтвердить номер телефона')]
      ]).resize().oneTime()
    );
  }
};

bot.start((ctx) => {
  sendUserStatus(ctx);
});

// Обработка кнопки "🔄 Сменить номер"
bot.action('change_phone', (ctx) => {
  ctx.answerCbQuery();
  const userId = ctx.from.id.toString();
  
  // Удаляем старый номер
  delete userPhones[userId];
  saveData();

  ctx.reply(
    'Старая привязка сброшена. Нажмите кнопку ниже, чтобы отправить новый номер телефона:',
    Markup.keyboard([
      [Markup.button.contactRequest('📱 Отправить новый номер')]
    ]).resize().oneTime()
  );
});

// Обработка получения контакта
bot.on('contact', (ctx) => {
  const userId = ctx.from.id.toString();
  const phoneNumber = ctx.message.contact.phone_number;

  userPhones[userId] = phoneNumber;
  saveData();

  ctx.reply('🎉 Спасибо! Номер успешно сохранен. Теперь вы можете вернуться в мини-приложение и опубликовать объявление.', {
    reply_markup: { remove_keyboard: true }
  });
});

bot.launch();
console.log('🤖 Telegram-бот запущен');


// --- БЭКЕНД API ДЛЯ МИНИ-ПРИЛОЖЕНИЯ ---

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

  const phone = userPhones[user.id.toString()];

  if (!phone) {
    return res.json({ verified: false });
  }

  res.json({ verified: true, phone });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Бэкенд сервер запущен на порту ${PORT}`);
});