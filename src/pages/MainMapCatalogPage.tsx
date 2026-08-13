import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property, FilterState, DistrictBishkek } from '../types/property';
import { PropertyCard } from '../components/PropertyCard';

interface MainMapCatalogPageProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

const DISTRICTS: (DistrictBishkek | 'Все')[] = [
  'Все',
  'ЦУМ / Центр',
  'Южные ворота',
  'Асанбай',
  'Джал',
  'Свердловский район',
  'Первомайский район',
  'Октябрьский район',
  'Ленинский район',
];

export const MainMapCatalogPage: React.FC<MainMapCatalogPageProps> = ({
  properties,
  onSelectProperty,
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  
  // Состояние фильтров для режима списка
  const [filters, setFilters] = useState<Partial<FilterState>>({ district: 'Все' });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Умная фильтрация (используется и для карты, и для списка)
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      const matchesSearch =
        prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDistrict = !filters.district || filters.district === 'Все' || prop.district === filters.district;
      return matchesSearch && matchesDistrict;
    });
  }, [properties, searchQuery, filters.district]);

  // 2. Инициализация карты (только ОДИН раз)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const bishkekCenter: [number, number] = [42.8746, 74.6122];

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(bishkekCenter, 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Обновление маркеров при изменении фильтров
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    filteredProperties.forEach((property) => {
      const isSelected = activeProperty?.id === property.id;
      
      const pinHtml = `
        <div style="
          background: ${isSelected ? 'var(--tg-theme-button-color, #2481cc)' : '#ffffff'}; 
          color: ${isSelected ? '#ffffff' : '#0f172a'}; 
          padding: 6px 10px; 
          border-radius: 20px; 
          font-weight: 700; 
          font-size: 12px; 
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); 
          border: 1px solid rgba(0,0,0,0.08); 
          white-space: nowrap;
          transition: all 0.2s ease;
          transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
          z-index: ${isSelected ? 1000 : 1};
        ">
          $${property.priceUSD}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: pinHtml,
        iconSize: [60, 32],
        iconAnchor: [30, 16],
      });

      const marker = L.marker([property.latitude, property.longitude], { icon: customIcon });

      marker.on('click', () => {
        setActiveProperty(property);
        // Виброотклик Telegram при выборе пина
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }
      });

      markersLayer.addLayer(marker);
    });
  }, [filteredProperties, activeProperty]);

  // 4. Корректировка размера карты при возвращении из списка
  useEffect(() => {
    if (viewMode === 'map' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [viewMode]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)]">
      
      {/* Универсальная верхняя панель (Поиск + Переключатель) */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-col gap-3 pointer-events-none">
        
        {/* Поисковая строка и свитчер */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex-1 bg-[var(--tg-theme-bg-color,#ffffff)]/95 backdrop-blur-xl border border-[var(--tg-theme-hint-color,#8e8e93)]/20 rounded-2xl shadow-lg flex items-center px-4 py-3">
            <input
              type="text"
              placeholder="Поиск по адресу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-[var(--tg-theme-text-color,#000000)] placeholder-[var(--tg-theme-hint-color,#8e8e93)] text-sm outline-none font-medium"
            />
          </div>

          <div className="bg-[var(--tg-theme-bg-color,#ffffff)]/95 backdrop-blur-xl border border-[var(--tg-theme-hint-color,#8e8e93)]/20 p-1 rounded-2xl shadow-lg flex shrink-0">
            <button
              onClick={() => { setViewMode('list'); setActiveProperty(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-[var(--tg-theme-text-color,#000000)] text-[var(--tg-theme-bg-color,#ffffff)] shadow-sm'
                  : 'text-[var(--tg-theme-hint-color,#8e8e93)] hover:text-[var(--tg-theme-text-color,#000000)]'
              }`}
            >
              Список
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-[var(--tg-theme-text-color,#000000)] text-[var(--tg-theme-bg-color,#ffffff)] shadow-sm'
                  : 'text-[var(--tg-theme-hint-color,#8e8e93)] hover:text-[var(--tg-theme-text-color,#000000)]'
              }`}
            >
              Карта
            </button>
          </div>
        </div>

        {/* Фильтры районов (видны только в режиме списка) */}
        {viewMode === 'list' && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto pb-1 -mx-4 px-4">
            {DISTRICTS.map((dist) => {
              const isActive = (filters.district || 'Все') === dist;
              return (
                <button
                  key={dist}
                  onClick={() => setFilters({ district: dist })}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--tg-theme-button-color,#2481cc)] text-[var(--tg-theme-button-text-color,#ffffff)] shadow-md'
                      : 'bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] border border-[var(--tg-theme-hint-color,#8e8e93)]/20 shadow-sm'
                  }`}
                >
                  {dist}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* СЛОЙ 1: КАРТА (Всегда в DOM, скрывается через z-index/opacity) */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${viewMode === 'map' ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}
      >
        <div ref={mapContainerRef} className="w-full h-full" onClick={() => setActiveProperty(null)} />

        {/* BottomSheet: Карточка при клике на пин */}
        {activeProperty && viewMode === 'map' && (
          <div className="absolute bottom-20 left-4 right-4 z-40 bg-[var(--tg-theme-bg-color,#ffffff)] rounded-3xl p-4 shadow-2xl border border-[var(--tg-theme-hint-color,#8e8e93)]/20 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="flex gap-4">
              <img
                src={activeProperty.images[0]}
                alt={activeProperty.title}
                className="w-28 h-28 object-cover rounded-2xl bg-gray-200"
              />
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--tg-theme-button-color,#2481cc)]">
                      {activeProperty.district}
                    </span>
                    <button
                      onClick={() => setActiveProperty(null)}
                      className="text-[var(--tg-theme-hint-color,#8e8e93)] hover:text-[var(--tg-theme-text-color,#000000)] text-sm font-bold px-1"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--tg-theme-text-color,#000000)] line-clamp-1">
                    {activeProperty.title}
                  </h4>
                  <p className="text-[11px] text-[var(--tg-theme-hint-color,#8e8e93)] mt-0.5 line-clamp-1">
                    {activeProperty.address}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-[var(--tg-theme-text-color,#000000)] leading-tight">
                      ${activeProperty.priceUSD}
                    </span>
                    <span className="text-[10px] text-[var(--tg-theme-hint-color,#8e8e93)] font-medium">/ месяц</span>
                  </div>
                  <button
                    onClick={() => onSelectProperty(activeProperty)}
                    className="bg-[var(--tg-theme-text-color,#000000)] text-[var(--tg-theme-bg-color,#ffffff)] px-5 py-2.5 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-transform"
                  >
                    Открыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* СЛОЙ 2: СПИСОК (Перекрывает карту при активации) */}
      <div 
        className={`absolute inset-0 bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] pt-32 pb-24 px-4 overflow-y-auto transition-transform duration-300 ${
          viewMode === 'list' ? 'z-20 translate-y-0' : 'z-0 translate-y-full pointer-events-none'
        }`}
      >
        {filteredProperties.length > 0 ? (
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
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
            <p className="text-sm font-semibold text-[var(--tg-theme-text-color,#000000)] mb-1">
              Ничего не найдено
            </p>
            <p className="text-xs text-[var(--tg-theme-hint-color,#8e8e93)]">
              Попробуйте изменить район или поисковый запрос
            </p>
          </div>
        )}
      </div>

    </div>
  );
};