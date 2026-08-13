import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

// 1. Типизация объекта Telegram WebApp
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
  
  // Методы и свойства
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void; // Добавили метод, чтобы не было ошибки TS
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

// 3. Провайдер-компонент
export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webApp, setWebApp] = useState<TelegramWebApp>();

  useEffect(() => {
    const app = window.Telegram?.WebApp;
    
    if (app) {
      app.ready();
      setWebApp(app);
      
      try {
        app.setHeaderColor('secondary_bg_color');
      } catch (e) {
        // Игнорируем, если версия ТГ не поддерживает
      }
    }
  }, []);

  const value = useMemo(() => {
    return {
      webApp,
      user: webApp?.initDataUnsafe?.user,
    };
  }, [webApp]);

  return React.createElement(TelegramContext.Provider, { value }, children);
};

// 4. Кастомный хук для использования контекста
export const useTelegram = () => {
  const context = useContext(TelegramContext);
  
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }

  // Возвращаем и оригинальные поля, и алиасы для полной совместимости с компонентами
  return {
    ...context,
    tg: context.webApp, // Алиас для тех компонентов, которые ждут tg
    isSupported: !!window.Telegram?.WebApp,
    isTelegram: Boolean(window.Telegram?.WebApp?.initData),
    closeApp: () => context.webApp?.close(),
    onClose: () => context.webApp?.close(), // Алиас для Header.tsx
    mainButton: context.webApp?.MainButton,
    MainButton: context.webApp?.MainButton, // Алиас с большой буквы
    backButton: context.webApp?.BackButton,
    BackButton: context.webApp?.BackButton, // Алиас с большой буквы
  };
};