import React, { useState, useEffect } from 'react';
import { Property, FilterState, DistrictBishkek } from '../types/property';
import { getListings } from '../api/listings';
import { PropertyCard } from '../components/PropertyCard';

interface CatalogPageProps {
  onSelectProperty: (property: Property) => void;
}

const DISTRICTS: (DistrictBishkek | 'all')[] = [
  'all',
  'Свердловский район',
  'Первомайский район',
  'Октябрьский район',
  'Ленинский район',
  'Южные ворота',
  'Асанбай',
  'ЦУМ / Центр',
  'Рабочий поселок',
  'Джал',
];

const ROOM_OPTIONS = [
  { label: 'Все', value: null },
  { label: '1к', value: 1 },
  { label: '2к', value: 2 },
  { label: '3к', value: 3 },
  { label: '4+', value: 4 },
];

export const CatalogPage: React.FC<CatalogPageProps> = ({ onSelectProperty }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Состояние фильтров
  const [filters, setFilters] = useState<Partial<FilterState>>({
    district: 'all',
    rooms: null,
    minPrice: 0,
    maxPrice: 5000,
    type: 'all',
  });

  // Загрузка объявлений с учетом фильтров
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getListings(filters)
      .then((data) => {
        if (isMounted) {
          setProperties(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch listings:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Дополнительная фильтрация по поисковой строке и ценовому диапазону
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch = 
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrice = prop.priceUSD >= (filters.minPrice ?? 0) && prop.priceUSD <= (filters.maxPrice ?? 5000);

    return matchesSearch && matchesPrice;
  });

  return (
    <div className="pb-24 px-4 pt-4">
      {/* Шапка каталога */}
      <div className="mb-3">
        <h1 className="text-xl font-extrabold text-[var(--tg-theme-text-color,#000000)]">
          Аренда жилья в Бишкеке
        </h1>
        <p className="text-xs text-[var(--tg-theme-hint-color,#999999)] mt-0.5">
          Проверенные квартиры без посредников
        </p>
      </div>

      {/* Поле поиска */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Поиск по району, улице..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[var(--tg-theme-secondary-bg-color,#efeff3)] text-[var(--tg-theme-text-color,#000000)] placeholder-[var(--tg-theme-hint-color,#999999)] text-sm rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-[var(--tg-theme-button-color,#2481cc)] transition-colors"
        />
      </div>

      {/* Фильтр по комнатам */}
      <div className="flex gap-2 mb-3">
        {ROOM_OPTIONS.map((opt) => {
          const isSelected = filters.rooms === opt.value;
          return (
            <button
              key={opt.label}
              onClick={() => setFilters((prev) => ({ ...prev, rooms: opt.value }))}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                isSelected
                  ? 'bg-[var(--tg-theme-button-color,#2481cc)] text-[var(--tg-theme-button-text-color,#ffffff)]'
                  : 'bg-[var(--tg-theme-secondary-bg-color,#efeff3)] text-[var(--tg-theme-text-color,#000000)]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Горизонтальный скролл фильтров по районам */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {DISTRICTS.map((dist) => {
          const isSelected = (filters.district || 'all') === dist;
          return (
            <button
              key={dist}
              onClick={() => setFilters((prev) => ({ ...prev, district: dist }))}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                isSelected
                  ? 'bg-[var(--tg-theme-button-color,#2481cc)] text-[var(--tg-theme-button-text-color,#ffffff)]'
                  : 'bg-[var(--tg-theme-secondary-bg-color,#efeff3)] text-[var(--tg-theme-text-color,#000000)]'
              }`}
            >
              {dist === 'all' ? 'Все районы' : dist}
            </button>
          );
        })}
      </div>

      {/* Фильтр по цене (от / до) */}
      <div className="flex items-center gap-2 mb-4 bg-[var(--tg-theme-secondary-bg-color,#efeff3)] p-2 rounded-xl">
        <div className="flex-1 flex items-center gap-1">
          <span className="text-[10px] text-[var(--tg-theme-hint-color,#999999)]">От ($)</span>
          <input
            type="number"
            value={filters.minPrice || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: Number(e.target.value) }))}
            placeholder="0"
            className="w-full bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] text-xs rounded-lg px-2 py-1.5 outline-none"
          />
        </div>
        <div className="flex-1 flex items-center gap-1">
          <span className="text-[10px] text-[var(--tg-theme-hint-color,#999999)]">До ($)</span>
          <input
            type="number"
            value={filters.maxPrice === 5000 ? '' : filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : 5000 }))}
            placeholder="5000"
            className="w-full bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] text-xs rounded-lg px-2 py-1.5 outline-none"
          />
        </div>
      </div>

      {/* Список или состояние загрузки */}
      {loading ? (
        <div className="text-center py-16 text-[var(--tg-theme-hint-color,#999999)] text-sm">
          Загрузка объектов...
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-[var(--tg-theme-hint-color,#999999)] text-sm">
          Ничего не найдено по вашим параметрам
        </div>
      )}
    </div>
  );
};