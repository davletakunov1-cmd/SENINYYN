import { Property } from '../types/property';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Евро-двушка в элитном доме, Асанбай',
    description: 'Сдается абсолютно новая квартира с дизайнерским ремонтом.',
    priceUSD: 650,
    rooms: 2,
    area: 55,
    floor: 7,
    totalFloors: 12,
    district: 'Асанбай',
    address: 'мкр. Асанбай, 24/1',
    latitude: 42.8256,
    longitude: 74.6152,
    type: 'apartment',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    owner: {
      name: 'Улан',
      phone: '+996 555 123 456',
      telegramUsername: 'ulan_rent'
    },
    createdAt: '2026-08-10'
  }
];