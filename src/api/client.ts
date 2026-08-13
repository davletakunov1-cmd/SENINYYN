const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.bishkek-rent.kg/v1';

export async function fetchWithTelegramAuth(endpoint: string, options: RequestInit = {}) {
  // Получаем initData для валидации на бэкенде
  const initData = window.Telegram?.WebApp?.initData || '';

  const headers = {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': initData,
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}