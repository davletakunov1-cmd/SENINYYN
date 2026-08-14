import 'dotenv/config';
import express from 'express';
import { Telegraf } from 'telegraf';
import crypto from 'crypto';
import cors from 'cors';
import fs from 'fs';

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const DB_FILE = './user_phones.json';

if (!BOT_TOKEN) {
  console.error('❌ Ошибка: BOT_TOKEN не задан');
  process.exit(1);
}

// Загрузка базы из файла при старте
let userPhones = {};
if (fs.existsSync(DB_FILE)) {
  userPhones = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

const saveData = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(userPhones, null, 2));
};

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(cors());

// --- БОТ ---
bot.start((ctx) => {
  ctx.reply('Привет! Для публикации объявлений подтвердите номер:', {
    reply_markup: {
      keyboard: [[{ text: '📱 Подтвердить номер', request_contact: true }]],
      one_time_keyboard: true
    }
  });
});

bot.on('contact', (ctx) => {
  const userId = ctx.from.id.toString(); // Сохраняем как строку для JSON
  const phoneNumber = ctx.message.contact.phone_number;

  userPhones[userId] = phoneNumber;
  saveData(); // Сохраняем в файл каждый раз при обновлении

  ctx.reply('✅ Номер подтвержден! Теперь вы можете вернуться в приложение.');
});

bot.launch();

// --- API ---
function verifyTelegramInitData(initDataString, botToken) {
  try {
    const urlParams = new URLSearchParams(initDataString);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => `${key}=${val}`).join('\n');
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash === hash) {
      return JSON.parse(urlParams.get('user'));
    }
    return null;
  } catch (e) { return null; }
}

app.get('/api/get-phone', (req, res) => {
  const initData = req.headers['x-telegram-init-data'];
  const user = verifyTelegramInitData(initData, BOT_TOKEN);
  
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const phone = userPhones[user.id.toString()];
  res.json({ verified: !!phone, phone: phone || null });
});

app.listen(3000, () => console.log('🌐 Сервер запущен на 3000'));