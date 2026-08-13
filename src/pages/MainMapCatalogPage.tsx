import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Property } from '../types/property';

interface MainMapCatalogPageProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const MainMapCatalogPage: React.FC<MainMapCatalogPageProps> = ({
  properties,
  onSelectProperty,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Фильтрация объектов по поиску
  const filteredProperties = properties.filter(
    (prop) =>
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Инициализация карты Leaflet
  useEffect(() => {
    if (viewMode === 'map' && mapContainerRef.current && !mapInstanceRef.current) {
      const bishkekCenter: [number, number] = [42.8746, 74.6122];

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView(bishkekCenter, 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Корректируем размер карты при переключении вкладок
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }

    return () => {
      if (viewMode !== 'map' && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode]);

  // Отрисовка маркеров на карте
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    filteredProperties.forEach((property) => {
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: var(--tg-theme-button-color, #2481cc); 
            color: var(--tg-theme-button-text-color, #ffffff); 
            padding: 5px 10px; 
            border-radius: 12px; 
            font-weight: 800; 
            font-size: 11px; 
            box-shadow: 0 6px 16px rgba(0,0,0,0.2); 
            white-space: nowrap;
            border: 2px solid #ffffff;
            transition: transform 0.2s;
          ">
            $${property.priceUSD} <span style="font-weight: 400; opacity: 0.8; font-size: 10px;">• ${property.rooms}к</span>
          </div>
        `,
        iconSize: [70, 36],
        iconAnchor: [35, 18],
      });

      const marker = L.marker([property.latitude, property.longitude], { icon: customIcon });

      // При клике на точку показываем всплывающую карточку вместо мгновенного перехода
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setActiveProperty(property);
      });

      markersLayer.addLayer(marker);
    });
  }, [filteredProperties]);

  return (
    <div className="relative w-full h-[calc(100vh-60px)] pb-16 flex flex-col bg-[var(--tg-theme-bg-color,#ffffff)] overflow-hidden">
      
      {/* Шапка: Поисковая строка + Переключатель Список/Карта */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col gap-2">
        <div className="bg-[var(--tg-theme-bg-color,#ffffff)]/90 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-black/5 flex items-center gap-2">
          <input
            type="text"
            placeholder="Район, улица или ЖК..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-xs rounded-xl px-3 py-2.5 outline-none"
          />

          {/* Переключатель Список / Карта */}
          <div className="flex bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] p-1 rounded-xl shrink-0">
            <button
              onClick={() => { setViewMode('list'); setActiveProperty(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-[var(--tg-theme-button-color,#2481cc)] text-[var(--tg-theme-button-text-color,#ffffff)] shadow-sm'
                  : 'text-[var(--tg-theme-hint-color,#8e8e93)]'
              }`}
            >
              Список
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-[var(--tg-theme-button-color,#2481cc)] text-[var(--tg-theme-button-text-color,#ffffff)] shadow-sm'
                  : 'text-[var(--tg-theme-hint-color,#8e8e93)]'
              }`}
            >
              Карта
            </button>
          </div>
        </div>
      </div>

      {/* Основной контент: Режим Карта или Режим Список */}
      {viewMode === 'map' ? (
        <div className="relative w-full h-full">
          <div ref={mapContainerRef} className="w-full h-full z-0" onClick={() => setActiveProperty(null)} />

          {/* Аккуратная всплывающая карточка квартиры при клике на пин */}
          {activeProperty && (
            <div className="absolute bottom-20 left-4 right-4 z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div 
                onClick={() => onSelectProperty(activeProperty)}
                className="bg-[var(--tg-theme-bg-color,#ffffff)] rounded-3xl p-3 shadow-2xl border border-black/10 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <img 
                  src={activeProperty.images[0]} 
                  alt={activeProperty.title} 
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-gray-200"
                />
                <div className="flex flex-col justify-between flex-grow overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[var(--tg-theme-button-color,#2481cc)] uppercase tracking-wider">
                        {activeProperty.district}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveProperty(null); }}
                        className="text-[var(--tg-theme-hint-color,#8e8e93)] text-xs px-1.5 py-0.5"
                      >
                        ✕
                      </button>
                    </div>
                    <h3 className="text-xs font-black truncate text-[var(--tg-theme-text-color,#000000)] mt-0.5">
                      {activeProperty.rooms}-комн., {activeProperty.area} м²
                    </h3>
                    <p className="text-[10px] text-[var(--tg-theme-hint-color,#8e8e93)] truncate mt-0.5">
                      {activeProperty.address}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5">
                    <span className="text-sm font-black text-[var(--tg-theme-text-color,#000000)]">
                      ${activeProperty.priceUSD} <span className="text-[10px] font-normal opacity-70">/ мес</span>
                    </span>
                    <span className="bg-[var(--tg-theme-button-color,#2481cc)] text-[var(--tg-theme-button-text-color,#ffffff)] px-3 py-1 rounded-xl text-[10px] font-bold shadow-sm">
                      Связаться
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Режим списка (если пользователь переключился обратно) */
        <div className="pt-20 px-4 overflow-y-auto grid grid-cols-2 gap-3">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              onClick={() => onSelectProperty(property)}
              className="bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] rounded-3xl overflow-hidden shadow-sm p-2 cursor-pointer"
            >
              <img src={property.images[0]} alt="" className="w-full h-32 object-cover rounded-2xl" />
              <div className="mt-2">
                <div className="text-xs font-bold">${property.priceUSD} / мес</div>
                <div className="text-[10px] text-[var(--tg-theme-hint-color,#8e8e93)] truncate">{property.address}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};