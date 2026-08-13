import React from 'react';
import { useTelegram } from '../hooks/useTelegram';

export const Header: React.FC = () => {
  const { user, onClose, tg } = useTelegram();
  const isTelegram = Boolean(tg);

  return (
    <header className="bg-[var(--tg-theme-secondary-bg-color)] p-4 flex items-center justify-between shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-[var(--tg-theme-text-color)]">
          Rent App Bishkek
        </h1>
        {user ? (
          <p className="text-xs text-[var(--tg-theme-hint-color)]">
            Привет, {user.first_name}! ID: {user.id}
          </p>
        ) : (
          <p className="text-xs text-[var(--tg-theme-hint-color)]">
            {isTelegram ? 'Загрузка профиля...' : 'Откройте приложение в Telegram'}
          </p>
        )}
      </div>

      {isTelegram && (
        <button 
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ✕ Закрыть
        </button>
      )}
    </header>
  );
};