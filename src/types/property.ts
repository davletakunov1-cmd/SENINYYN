export type PropertyType = 'apartment' | 'house' | 'room' | 'commercial';

export type DistrictBishkek = 
  | 'Свердловский район'
  | 'Первомайский район'
  | 'Октябрьский район'
  | 'Ленинский район'
  | 'Южные ворота'
  | 'Асанбай'
  | 'ЦУМ / Центр'
  | 'Рабочий поселок'
  | 'Джал';

export interface Property {
  id: string;
  title: string;
  description: string;
  priceUSD: number;
  priceKGS?: number;
  rooms: number;
  area: number;
  floor: number;
  totalFloors: number;
  district: DistrictBishkek;
  address: string;
  latitude: number;
  longitude: number;
  type: PropertyType;
  images: string[];
  owner: {
    name: string;
    phone: string;
    telegramUsername?: string;
  };
  createdAt: string;
}

export interface FilterState {
  district: string;
  rooms: number | null;
  minPrice: number;
  maxPrice: number;
  type: PropertyType | 'all';
}