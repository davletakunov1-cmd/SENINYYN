import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Property } from '../types/property';

interface MapPageProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ properties, onSelectProperty }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const bishkekCenter: [number, number] = [42.8746, 74.6122];

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView(bishkekCenter, 13);

      // Используем чистые минималистичные тайлы (CartoDB Positron), 
      // которые выглядят в разы дороже стандартного OpenStreetMap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    properties.forEach((property) => {
      // Создаем супер-стильные маркеры с тенью и плавным эффектом
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: var(--tg-theme-button-color, #2481cc); 
            color: var(--tg-theme-button-text-color, #ffffff); 
            padding: 6px 12px; 
            border-radius: 14px; 
            font-weight: 800; 
            font-size: 11px; 
            box-shadow: 0 8px 20px rgba(0,0,0,0.18); 
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid #ffffff;
            transition: transform 0.2s;
          ">
            <span>$${property.priceUSD}</span>
            <span style="font-weight: 400; opacity: 0.85; font-size: 10px;">• ${property.rooms}к</span>
          </div>
        `,
        iconSize: [75, 38],
        iconAnchor: [37, 19],
      });

      const marker = L.marker([property.latitude, property.longitude], { icon: customIcon });

      marker.on('click', () => {
        onSelectProperty(property);
      });

      markersLayer.addLayer(marker);
    });
  }, [properties, onSelectProperty]);

  return (
    <div className="relative w-full h-[calc(100vh-60px)] pb-14">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Плавающая аккуратная плашка сверху */}
      <div className="absolute top-4 left-4 right-4 z-10 bg-[var(--tg-theme-bg-color,#ffffff)]/85 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl border border-black/5 flex items-center justify-between">
        <div>
          <span className="text-xs font-black text-[var(--tg-theme-text-color,#000000)] tracking-tight">
            Карта объектов Бишкека
          </span>
          <p className="text-[10px] text-[var(--tg-theme-hint-color,#8e8e93)] mt-0.5">
            Найдено вариантов: {properties.length}
          </p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </div>
  );
};