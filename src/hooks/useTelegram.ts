import { createContext, useContext, useEffect, useState, useMemo } from 'react';

// 1. Типизация объекта Telegram WebApp (частичная, только то, что используем)
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  
  // Методы, которые мы используем
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    onClick: (callback: VoidFunction) => void;
    offClick: (callback: VoidFunction) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: VoidFunction) => void;
    offClick: (callback: VoidFunction) => void;
  };
  // Дополнительные методы для открытия ссылок/профилей
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showPopup: (params: any, callback?: (button_id: string) => void) => void;
  scanQrPopup: (params: any, callback?: (text: string) => void) => void;
  closeQrPopup: () => void;
}

// Расширяем глобальный объект window
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// 2. Создание контекста
interface TelegramContextType {
  webApp?: TelegramWebApp;
  user?: TelegramUser;
}

const TelegramContext = createContext<TelegramContextType>({});

// 3. Провайдер-компонент (Оборачиваем им все приложение в index.tsx)
export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webApp, setWebApp] = useState<TelegramWebApp>();

  useEffect(() => {
    // При монтировании компонента инициализируем WebApp
    const app = window.Telegram?.WebApp;
    
    if (app) {
      app.ready(); // Сообщаем Telegram, что приложение готово
      // app.expand(); // Раскрываем на весь экран (по желанию)
      setWebApp(app);
      
      // Применяем CSS-переменные темы Telegram к body для использования в Tailwind
      // Например, var(--tg-theme-bg-color)
      app.setHeaderColor('secondary_bg_color');
    }
  }, []);

  // Мемоизация значения контекста, чтобы избежать лишних ре-рендеров
  const value = useMemo(() => {
    return {
      webApp,
      user: webApp?.initDataUnsafe?.user, // Безопасно достаем юзера
    };
  }, [webApp]);

  return React.createElement(TelegramContext.Provider, { value }, children);
};

// 4. Кастомный хук для использования контекста в компонентах
export const useTelegram = () => {
  const context = useContext(TelegramContext);
  
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }

  // Возвращаем удобные методы и данные
  return {
    ...context,
    // Вспомогательные флаги
    isSupported: !!window.Telegram?.WebApp,
    isTelegram: !!window.Telegram?.WebApp.initData,
    // Удобный доступ к методам
    closeApp: () => context.webApp?.close(),
    mainButton: context.webApp?.MainButton,
    backButton: context.webApp?.BackButton,
  };
};