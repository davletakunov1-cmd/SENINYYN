import { Property, FilterState } from '../types/property';
import { MOCK_PROPERTIES } from './mockData';

// Получение списка объявлений с фильтрацией
export async function getListings(filters?: Partial<FilterState>): Promise<Property[]> {
  // В продакшене здесь будет реальный запрос:
  // return fetchWithTelegramAuth(`/listings?${new URLSearchParams(filters as any))}`);

  // Для разработки используем мок-данные с имитацией задержки сети
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = [...MOCK_PROPERTIES];

      if (filters) {
        if (filters.district && filters.district !== 'all') {
          result = result.filter((p) => p.district === filters.district);
        }
        if (filters.rooms) {
          result = result.filter((p) => p.rooms === filters.rooms);
        }
        if (filters.type && filters.type !== 'all') {
          result = result.filter((p) => p.type === filters.type);
        }
      }

      resolve(result);
    }, 300);
  });
}

// Создание нового объявления
export async function createListing(newProperty: Omit<Property, 'id' | 'createdAt'>): Promise<Property> {
  // В продакшене:
  // return fetchWithTelegramAuth('/listings', {
  //   method: 'POST',
  //   body: JSON.stringify(newProperty),
  // });

  return new Promise((resolve) => {
    setTimeout(() => {
      const created: Property = {
        ...newProperty,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      resolve(created);
    }, 500);
  });
}