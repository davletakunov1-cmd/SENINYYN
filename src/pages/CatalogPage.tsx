import React, { useState, useMemo, useTransition } from 'react';
import { Property, FilterState } from '../types/property';
import { PropertyCard } from '../components/PropertyCard';
import { PropertySkeleton } from '../components/PropertySkeleton';

interface CatalogPageProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onNavigateToAdd: () => void; // <--- добавили в пропсы
  isLoading?: boolean;
}

const CATEGORIES = [
  { 
    id: 'buy', 
    label: 'Купить', 
    type: 'sale',
    image: '/images/cat-buy.png',
    imageClassName: 'w-28 h-28 -right-4 -bottom-4 object-contain'
  },
  { 
    id: 'rent', 
    label: 'Снять', 
    type: 'rent',
    image: '/images/cat-rent.png',
    imageClassName: 'w-32 h-32 -right-5 -bottom-5 object-contain'
  },
  { 
    id: 'commercial', 
    label: 'Коммерческая', 
    type: 'commercial',
    image: '/images/cat-commercial.png',
    imageClassName: 'w-28 h-28 -right-4 -bottom-4 object-contain'
  },
  { 
    id: 'new', 
    label: 'Новостройки', 
    type: 'new',
    image: '/images/cat-new.png',
    imageClassName: 'w-28 h-28 -right-4 -bottom-4 object-contain'
  },
  { 
    id: 'daily', 
    label: 'Посуточно', 
    type: 'daily',
    image: '/images/cat-daily.png',
    imageClassName: 'w-28 h-28 -right-4 -bottom-4 object-contain'
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

const DISTRICTS = [
  { label: 'Все районы', value: 'all' },
  { label: 'Первомайский', value: 'Первомайский' },
  { label: 'Свердловский', value: 'Свердловский' },
  { label: 'Октябрьский', value: 'Октябрьский' },
  { label: 'Ленинский', value: 'Ленинский' },
];

export const CatalogPage: React.FC<CatalogPageProps> = ({ 
  properties, 
  onSelectProperty, 
  onNavigateToAdd,
  isLoading = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<Partial<FilterState>>({
    district: 'all',
    rooms: null,
    minPrice: 0,
    maxPrice: 5000,
  });

  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
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
      
      const matchesRooms = 
        filters.rooms === null || 
        filters.rooms === undefined || 
        (filters.rooms === 4 ? prop.rooms >= 4 : prop.rooms === filters.rooms);
      
      const matchesCategory = selectedCategory === 'all' || prop.type === selectedCategory;

      return matchesSearch && matchesPrice && matchesDistrict && matchesRooms && matchesCategory;
    }).sort((a, b) => b.id.localeCompare(a.id));
  }, [properties, searchQuery, filters, selectedCategory]);

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.district && filters.district !== 'all') count++;
    if (filters.rooms !== null && filters.rooms !== undefined) count++;
    if (filters.minPrice && filters.minPrice > 0) count++;
    if (filters.maxPrice && filters.maxPrice < 5000) count++;
    return count;
  }, [filters]);

  const handleCategoryClick = (catType: string, isMore?: boolean) => {
    triggerHaptic();
    const targetCategory = isMore ? 'all' : catType;

    if (selectedCategory === targetCategory) {
      setIsFilterModalOpen(true);
    } else {
      setSelectedCategory(targetCategory);
    }
  };

  return (
    <div className="pb-32 px-4 pt-4 max-w-xl mx-auto bg-slate-50 min-h-screen text-slate-900 relative">
      
      {/* Шапка */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 cursor-pointer">
          <span className="text-sm font-extrabold text-slate-900">Бишкек и область</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <button 
          onClick={() => {
            triggerHaptic();
            onNavigateToAdd(); // <--- переключаем на вкладку добавления
          }}
          className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95"
        >
          + Разместить
        </button>
      </div>

      {/* Поиск и кнопка фильтров */}
      <div className="flex gap-2.5 mb-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="w-full bg-white text-slate-900 placeholder-slate-400 text-xs rounded-2xl pl-11 pr-4 py-4 outline-none font-semibold shadow-xs border border-slate-200 focus:border-blue-600 transition-all"
          />
        </div>
        
        <button
          onClick={() => {
            triggerHaptic();
            setIsFilterModalOpen(true);
          }}
          className={`relative px-4 rounded-2xl flex items-center justify-center border transition-all ${
            activeFiltersCount > 0 
              ? 'bg-blue-600 text-white border-transparent shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Сетка категорий */}
      <div className="grid grid-cols-3 gap-3 mb-4 pt-2">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.type;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.type, cat.isMore)}
              className={`relative overflow-visible p-3.5 rounded-2xl text-left transition-all border h-28 flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-50/50 text-blue-950 border-blue-600 shadow-md shadow-blue-600/10 ring-1 ring-blue-600'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <span className="text-[13px] font-bold tracking-tight leading-snug z-10 max-w-[75%]">
                {cat.label}
              </span>

              {cat.image ? (
                <div className={`absolute pointer-events-none flex items-end justify-end z-20 ${cat.imageClassName || 'w-28 h-28 -right-4 -bottom-4'}`}>
                  <img src={cat.image} alt={cat.label} className="w-full h-full object-contain drop-shadow-md" />
                </div>
              ) : cat.isMore ? (
                <div className="absolute right-3 bottom-3 w-7 h-7 rounded-full bg-slate-100 text-blue-600 flex items-center justify-center z-20">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Быстрые фильтры по комнатам */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Комнаты:</span>
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
                  ? 'bg-blue-600 text-white border-transparent shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {room.label}
            </button>
          );
        })}
      </div>

      {/* Модальное окно фильтров */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Фильтры поиска</h3>
              <button 
                onClick={() => {
                  triggerHaptic();
                  setIsFilterModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="py-4 overflow-y-auto flex flex-col gap-4 no-scrollbar">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Район</span>
                <select
                  value={filters.district || 'all'}
                  onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full bg-slate-50 text-xs p-3.5 rounded-xl outline-none font-semibold text-slate-900 border border-slate-200 focus:border-blue-600"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Бюджет (USD)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="От $0"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                    className="bg-slate-50 text-xs p-3.5 rounded-xl outline-none font-semibold text-slate-900 border border-slate-200 focus:border-blue-600"
                  />
                  <input
                    type="number"
                    placeholder="До $5000"
                    value={filters.maxPrice === 5000 ? '' : filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : 5000 }))}
                    className="bg-slate-50 text-xs p-3.5 rounded-xl outline-none font-semibold text-slate-900 border border-slate-200 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => {
                    triggerHaptic();
                    setFilters({ district: 'all', rooms: null, minPrice: 0, maxPrice: 5000 });
                  }}
                  className="w-full py-2.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Сбросить все параметры
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  triggerHaptic();
                  setIsFilterModalOpen(false);
                }}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-orange-500/20 transition-all active:scale-95"
              >
                Смотреть {filteredProperties.length} объявлений
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Список недвижимости */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-base font-black tracking-tight text-slate-900">
          Могут подойти
        </h2>
        <span className="text-xs font-semibold text-slate-400">
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
          <p className="text-sm font-bold text-slate-900 mb-1">Ничего не найдено</p>
          <p className="text-xs text-slate-400 mb-4">Попробуйте изменить параметры поиска</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setFilters({ district: 'all', rooms: null, minPrice: 0, maxPrice: 5000 });
            }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20"
          >
            Сбросить всё
          </button>
        </div>
      )}
    </div>
  );
};