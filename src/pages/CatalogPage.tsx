import React, { useState, useMemo, useTransition } from 'react';
import { Property, FilterState } from '../types/property';
import { PropertyCard } from '../components/PropertyCard';
import { PropertySkeleton } from '../components/PropertySkeleton';

interface CatalogPageProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  { 
    id: 'buy', 
    label: 'Купить', 
    type: 'sale',
    image: '/images/cat-buy.png'
  },
  { 
    id: 'rent', 
    label: 'Снять', 
    type: 'rent',
    image: '/images/cat-rent.png'
  },
  { 
    id: 'commercial', 
    label: 'Коммерческая', 
    type: 'commercial',
    image: '/images/cat-commercial.png'
  },
  { 
    id: 'new', 
    label: 'Новостройки', 
    type: 'new',
    image: '/images/cat-new.png',
    imageClassName: 'w-24 h-24 -right-2 -bottom-2 scale-125' // Увеличили размер и чуть сдвинули за границы
  },
  { 
    id: 'daily', 
    label: 'Посуточно', 
    type: 'daily',
    image: '/images/cat-daily.png'
  },
  { 
    id: 'all', 
    label: 'Все категории', 
    type: 'all',
    isMore: true
  },
];

const QUICK_ROOMS = [
  { label: 'Все', value: null },
  { label: '1к', value: 1 },
  { label: '2к', value: 2 },
  { label: '3к', value: 3 },
  { label: '4+', value: 4 },
];

export const CatalogPage: React.FC<CatalogPageProps> = ({ 
  properties, 
  onSelectProperty, 
  isLoading = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<Partial<FilterState>>({
    district: 'all',
    rooms: null,
    minPrice: 0,
    maxPrice: 5000,
  });

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
      
      const matchesCategory = selectedCategory === 'all' || prop.type === selectedCategory;

      return matchesSearch && matchesPrice && matchesDistrict && matchesRooms && matchesCategory;
    });

    return result.sort((a, b) => b.id.localeCompare(a.id));
  }, [properties, searchQuery, filters, selectedCategory]);

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  return (
    <div className="pb-32 px-4 pt-4 max-w-xl mx-auto bg-[var(--tg-theme-bg-color,#ffffff)] min-h-screen">
      
      {/* Шапка с локацией */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 cursor-pointer">
          <span className="text-sm font-extrabold text-[var(--tg-theme-text-color,#000000)]">Бишкек и область</span>
          <svg className="w-4 h-4 text-[var(--tg-theme-hint-color,#8e8e93)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <button 
          onClick={triggerHaptic}
          className="text-xs font-bold text-[var(--tg-theme-button-color,#2481cc)] bg-[var(--tg-theme-button-color,#2481cc)]/10 px-3.5 py-2 rounded-xl transition-all"
        >
          + Разместить
        </button>
      </div>

      {/* Строка поиска и кнопка фильтра */}
      <div className="flex gap-2.5 mb-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[var(--tg-theme-hint-color,#8e8e93)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Что ищете? (ЖК, улица, район)"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              startTransition(() => setSearchQuery(val));
            }}
            className="w-full bg-[var(--tg-theme-secondary-bg-color,#efeff3)] text-[var(--tg-theme-text-color,#000000)] placeholder-[var(--tg-theme-hint-color,#8e8e93)] text-xs rounded-2xl pl-11 pr-4 py-4 outline-none font-semibold shadow-2xs border border-black/5"
          />
        </div>
        
        <button
          onClick={() => {
            triggerHaptic();
            setIsFilterOpen(!isFilterOpen);
          }}
          className={`px-4 rounded-2xl flex items-center justify-center border transition-all ${
            isFilterOpen 
              ? 'bg-[var(--tg-theme-text-color,#000000)] text-[var(--tg-theme-bg-color,#ffffff)] border-transparent'
              : 'bg-[var(--tg-theme-secondary-bg-color,#efeff3)] text-[var(--tg-theme-text-color,#000000)] border-black/5'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>

      {/* Сетка категорий 3х2 (как на референсе) */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.type;
          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic();
                setSelectedCategory(cat.isMore ? 'all' : (isActive ? 'all' : cat.type));
              }}
              className={`relative overflow-hidden p-3 rounded-2xl text-left transition-all border h-28 flex flex-col justify-between ${
                isActive
                  ? 'bg-[var(--tg-theme-text-color,#000000)] text-[var(--tg-theme-bg-color,#ffffff)] border-transparent shadow-md'
                  : 'bg-[var(--tg-theme-secondary-bg-color,#efeff3)] text-[var(--tg-theme-text-color,#000000)] border-black/5 hover:border-black/10'
              }`}
            >
              {/* Текст в левом верхнем углу */}
              <span className="text-xs font-extrabold tracking-tight z-10">
                {cat.label}
              </span>

              {/* Графика в правом нижнем углу с кастомными стилями */}
              {cat.image ? (
                <div className={`absolute pointer-events-none flex items-end justify-end ${cat.imageClassName || 'right-0 bottom-0 w-16 h-16 p-1'}`}>
                  <img src={cat.image} alt={cat.label} className="w-full h-full object-contain" />
                </div>
              ) : cat.isMore ? (
                <div className="absolute right-3 bottom-3 w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-[var(--tg-theme-text-color,#000000)]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Быстрые фильтры комнат */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] font-bold text-[var(--tg-theme-hint-color,#8e8e93)] uppercase tracking-wider mr-1">Комнаты:</span>
        {QUICK_ROOMS.map((room) => {
          const isSelected = filters.rooms === room.value;
          return (
            <button
              key={room.label}
              onClick={() => {
                triggerHaptic();
                setFilters(prev => ({ ...prev, rooms: room.value }));
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                isSelected
                  ? 'bg-[var(--tg-theme-text-color,#000000)] text-[var(--tg-theme-bg-color,#ffffff)] border-transparent'
                  : 'bg-[var(--tg-theme-secondary-bg-color,#efeff3)] text-[var(--tg-theme-text-color,#000000)] border-black/5'
              }`}
            >
              {room.label}
            </button>
          );
        })}
      </div>

      {/* Панель детальных фильтров */}
      {isFilterOpen && (
        <div className="mb-4 p-4 bg-[var(--tg-theme-secondary-bg-color,#efeff3)] rounded-2xl border border-black/5 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[var(--tg-theme-text-color,#000000)]">Бюджет (USD)</span>
            <button 
              onClick={() => setFilters({ district: 'all', rooms: null, minPrice: 0, maxPrice: 5000 })}
              className="text-[11px] font-semibold text-[var(--tg-theme-hint-color,#8e8e93)]"
            >
              Сбросить
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="От $0"
              value={filters.minPrice || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
              className="bg-[var(--tg-theme-bg-color,#ffffff)] text-xs p-3.5 rounded-xl outline-none font-semibold text-[var(--tg-theme-text-color,#000000)] border border-black/5"
            />
            <input
              type="number"
              placeholder="До $5000"
              value={filters.maxPrice === 5000 ? '' : filters.maxPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : 5000 }))}
              className="bg-[var(--tg-theme-bg-color,#ffffff)] text-xs p-3.5 rounded-xl outline-none font-semibold text-[var(--tg-theme-text-color,#000000)] border border-black/5"
            />
          </div>
        </div>
      )}

      {/* Лента объектов */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-base font-black tracking-tight text-[var(--tg-theme-text-color,#000000)]">
          Могут подойти
        </h2>
        <span className="text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)]">
          {filteredProperties.length} предложений
        </span>
      </div>

      {isLoading || isPending ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((n) => (
            <PropertySkeleton key={n} />
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-sm font-bold text-[var(--tg-theme-text-color,#000000)] mb-1">Ничего не найдено</p>
          <p className="text-xs text-[var(--tg-theme-hint-color,#8e8e93)] mb-4">Попробуйте изменить параметры поиска</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setFilters({ district: 'all', rooms: null, minPrice: 0, maxPrice: 5000 });
            }}
            className="px-5 py-2.5 bg-[var(--tg-theme-text-color,#000000)] text-[var(--tg-theme-bg-color,#ffffff)] rounded-xl text-xs font-bold"
          >
            Сбросить всё
          </button>
        </div>
      )}
    </div>
  );
};