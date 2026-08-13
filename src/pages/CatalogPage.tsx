import React, { useState, useMemo, useTransition } from 'react';
import { Property, FilterState, DistrictBishkek } from '../types/property';
import { PropertyCard } from '../components/PropertyCard';
import { PropertySkeleton } from '../components/PropertySkeleton';

interface CatalogPageProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  isLoading?: boolean;
}

const DISTRICTS: (DistrictBishkek | 'all')[] = [
  'all',
  'ЦУМ / Центр',
  'Южные ворота',
  'Асанбай',
  'Джал',
  'Свердловский район',
  'Первомайский район',
  'Октябрьский район',
  'Ленинский район',
  'Рабочий поселок',
];

const ROOM_OPTIONS = [
  { label: 'Все', value: null },
  { label: '1 к.', value: 1 },
  { label: '2 к.', value: 2 },
  { label: '3 к.', value: 3 },
  { label: '4+ к.', value: 4 },
];

export const CatalogPage: React.FC<CatalogPageProps> = ({ 
  properties, 
  onSelectProperty, 
  isLoading = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<Partial<FilterState>>({
    district: 'all',
    rooms: null,
    minPrice: 0,
    maxPrice: 5000,
    type: 'all',
  });

  // Мемоизированная фильтрация и сортировка с защитой от фризов
  const filteredProperties = useMemo(() => {
    const result = properties.filter((prop) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        prop.title.toLowerCase().includes(query) ||
        prop.address.toLowerCase().includes(query) ||
        prop.district.toLowerCase().includes(query);

      const minP = filters.minPrice ?? 0;
      const maxP = filters.maxPrice ?? 5000;
      const matchesPrice = prop.priceUSD >= minP && prop.priceUSD <= maxP;
      
      const matchesDistrict = !filters.district || filters.district === 'all' || prop.district === filters.district;
      const matchesRooms = filters.rooms === null || (filters.rooms === 4 ? prop.rooms >= 4 : prop.rooms === filters.rooms);

      return matchesSearch && matchesPrice && matchesDistrict && matchesRooms;
    });

    return result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceUSD - b.priceUSD;
      if (sortBy === 'price_desc') return b.priceUSD - a.priceUSD;
      return b.id.localeCompare(a.id);
    });
  }, [properties, searchQuery, filters, sortBy]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  return (
    <div className="pb-28 px-4 pt-4 max-w-2xl mx-auto bg-[var(--tg-theme-bg-color,#ffffff)] min-h-screen">
      
      {/* Шапка и сортировка */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-[var(--tg-theme-text-color,#000000)]">
            Аренда жилья в Бишкеке
          </h1>
          <p className="text-xs text-[var(--tg-theme-hint-color,#8e8e93)] mt-0.5">
            Найдено объектов: <span className="font-bold text-[var(--tg-theme-text-color,#000000)]">{filteredProperties.length}</span>
          </p>
        </div>

        <select
          value={sortBy}
          onChange={(e) => {
            triggerHaptic();
            setSortBy(e.target.value as any);
          }}
          className="bg-[var(--tg-theme-secondary-bg-color,#efeff3)] text-[var(--tg-theme-text-color,#000000)] text-xs font-bold px-3 py-2 rounded-xl outline-none border border-black/5 cursor-pointer shadow-sm"
        >
          <option value="newest">Сначала новые</option>
          <option value="price_asc">Сначала дешевле</option>
          <option value="price_desc">Сначала дороже</option>
        </select>
      </div>

      {/* Поиск */}
      <div className="mb-3 relative">
        <input
          type="text"
          placeholder="Поиск по району, ЖК или улице..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-[var(--tg-theme-secondary-bg-color,#efeff3)] text-[var(--tg-theme-text-color,#000000)] placeholder-[var(--tg-theme-hint-color,#8e8e93)] text-sm rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-[var(--tg-theme-button-color,#2481cc)] transition-colors shadow-sm font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--tg-theme-hint-color,#8e8e93)] px-2 py-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Фильтр комнат */}
      <div className="flex gap-2 mb-3">
        {ROOM_OPTIONS.map((opt) => {
          const isSelected = filters.rooms === opt.value;
          return (
            <button
              key={opt.label}
              onClick={() => {
                triggerHaptic();
                setFilters((prev) => ({ ...prev, rooms: opt.value }));
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-[var(--tg-theme-text-color,#000000)] text-[var(--tg-theme-bg-color,#ffffff)] shadow-sm scale-[1.02]'
                  : 'bg-[var(--tg-theme-secondary-bg-color,#efeff3)] text-[var(--tg-theme-text-color,#000000)]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Скролл районов */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar -mx-4 px-4">
        {DISTRICTS.map((dist) => {
          const isSelected = (filters.district || 'all') === dist;
          return (
            <button
              key={dist}
              onClick={() => {
                triggerHaptic();
                setFilters((prev) => ({ ...prev, district: dist }));
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-[var(--tg-theme-button-color,#2481cc)] text-[var(--tg-theme-button-text-color,#ffffff)] shadow-md'
                  : 'bg-[var(--tg-theme-secondary-bg-color,#efeff3)] text-[var(--tg-theme-text-color,#000000)]'
              }`}
            >
              {dist === 'all' ? 'Все районы' : dist}
            </button>
          );
        })}
      </div>

      {/* Фильтр цен */}
      <div className="flex items-center gap-2 mb-5 bg-[var(--tg-theme-secondary-bg-color,#efeff3)] p-2.5 rounded-2xl shadow-sm border border-black/5">
        <div className="flex-1 flex items-center gap-2 px-3 bg-[var(--tg-theme-bg-color,#ffffff)] rounded-xl py-2 border border-black/5">
          <span className="text-[11px] text-[var(--tg-theme-hint-color,#8e8e93)] font-medium">От $</span>
          <input
            type="number"
            value={filters.minPrice || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: Number(e.target.value) }))}
            placeholder="0"
            className="w-full bg-transparent text-[var(--tg-theme-text-color,#000000)] text-xs outline-none font-bold"
          />
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 bg-[var(--tg-theme-bg-color,#ffffff)] rounded-xl py-2 border border-black/5">
          <span className="text-[11px] text-[var(--tg-theme-hint-color,#8e8e93)] font-medium">До $</span>
          <input
            type="number"
            value={filters.maxPrice === 5000 ? '' : filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : 5000 }))}
            placeholder="5000"
            className="w-full bg-transparent text-[var(--tg-theme-text-color,#000000)] text-xs outline-none font-bold"
          />
        </div>
      </div>

      {/* Рендер списка / скелетонов */}
      {isLoading || isPending ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((n) => (
            <PropertySkeleton key={n} />
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4">
          <p className="text-sm font-bold text-[var(--tg-theme-text-color,#000000)] mb-1">
            Ничего не найдено
          </p>
          <p className="text-xs text-[var(--tg-theme-hint-color,#8e8e93)] mb-4">
            Попробуйте изменить параметры поиска или сбросить фильтры
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilters({
                district: 'all',
                rooms: null,
                minPrice: 0,
                maxPrice: 5000,
                type: 'all',
              });
            }}
            className="px-5 py-3 rounded-2xl text-xs font-bold bg-[var(--tg-theme-text-color,#000000)] text-[var(--tg-theme-bg-color,#ffffff)] active:scale-95 transition-all shadow-lg"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
};