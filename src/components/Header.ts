import React from 'react';
import { useTelegram } from '../hooks/useTelegram'; // Импортируем хук

export const Header: React.FC = () => {
  // Используем хук для получения данных и методов
  const { user, closeApp, isTelegram } = useTelegram();

  return (
    <header className="bg-[var(--tg-theme-secondary-bg-color)] p-4 flex items-center justify-between shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-[var(--tg-theme-text-color)]">
          Rent App Bishkek
        </h1>
        {/* Используем данные юзера */}
        {user ? (
          <p className="text-xs text-[var(--tg-theme-hint-color)]">
            Привет, {user.first_name}! ID: {user.id}
            {user.is_premium && ' 👑'}
          </p>
        ) : (
          <p className="text-xs text-[var(--tg-theme-hint-color)]">
            {isTelegram ? 'Загрузка профиля...' : 'Откройте приложение в Telegram'}
          </p>
        )}
      </div>

      {/* Кнопка закрытия приложения */}
      {isTelegram && (
        <button 
          onClick={closeApp}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ✕ Закрыть
        </button>
      )}
    </header>
  );
};