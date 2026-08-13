import React from 'react';
import { Property } from '../types/property';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  const pricePerSquareMeter = Math.round(property.priceUSD / property.area);

  return (
    <div 
      onClick={() => onSelect(property)}
      className="group bg-[var(--tg-theme-secondary-bg-color,#ffffff)] rounded-[20px] overflow-hidden shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer flex flex-col border border-[var(--tg-theme-hint-color,#999999)]/10"
    >
      {/* Изображение с градиентом */}
      <div className="relative h-52 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <img 
          src={property.images[0]} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Район и количество фото */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
          <span className="bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[11px] font-semibold tracking-wide border border-white/10">
            {property.district}
          </span>
          {property.images.length > 1 && (
            <span className="bg-black/40 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-medium border border-white/10 flex items-center gap-1">
              📷 {property.images.length}
            </span>
          )}
        </div>

        {/* Цена поверх картинки снизу */}
        <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
          <div className="text-xl font-extrabold tracking-tight">
            ${property.priceUSD.toLocaleString()} <span className="text-xs font-normal text-white/80">/ мес</span>
          </div>
          <span className="text-[11px] font-medium bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
            ${pricePerSquareMeter} / м²
          </span>
        </div>
      </div>

      {/* Текстовая информация */}
      <div className="p-4 flex flex-col justify-between flex-grow bg-[var(--tg-theme-bg-color,#ffffff)]">
        <div>
          <h3 className="text-sm font-bold text-[var(--tg-theme-text-color,#000000)] tracking-tight mb-1">
            {property.rooms}-комн. кв., {property.area} м² • {property.floor}/{property.totalFloors} этаж
          </h3>
          <p className="text-xs text-[var(--tg-theme-hint-color,#8e8e93)] line-clamp-1 font-normal">
            {property.address}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--tg-theme-hint-color,#8e8e93)]/10 text-xs">
          <span className="text-[var(--tg-theme-hint-color,#8e8e93)] font-medium">Свежее объявление</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">Без комиссии</span>
        </div>
      </div>
    </div>
  );
};