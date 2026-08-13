import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Ваши стили (Tailwind)
import { TelegramProvider } from './hooks/useTelegram'; // Импортируем провайдер

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  // Оборачиваем приложение
  <TelegramProvider>
    <App />
  </TelegramProvider>
);