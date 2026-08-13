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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([42.8746, 74.6122], 12);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
    }).addTo(map);

    const bounds: L.LatLngTuple[] = [];

    properties.forEach((prop) => {
      bounds.push([prop.latitude, prop.longitude]);
      
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background: var(--tg-theme-button-color, #2481cc); color: white; padding: 4px 8px; border-radius: 8px; font-weight: bold; font-size: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                 $${prop.priceUSD}
               </div>`,
        iconSize: [40, 24],
      });

      L.marker([prop.latitude, prop.longitude], { icon: customIcon })
        .addTo(map)
        .on('click', () => onSelectProperty(prop));
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    mapInstanceRef.current = map;

    return () => { map.remove(); };
  }, [properties, onSelectProperty]);

  return (
    <div className="relative w-full h-[calc(100vh-60px)]">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};