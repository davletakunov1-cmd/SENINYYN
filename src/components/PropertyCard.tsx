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
      className="group bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl active:scale-[0.97] transition-all duration-300 cursor-pointer flex flex-col border border-black/5"
    >
      {/* Изображение с градиентом */}
      <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
        <img 
          src={property.images[0]} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        
        {/* Темный градиент для читаемости плашек поверх фото */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Бейдж района (стекломорфизм) */}
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-semibold tracking-wide uppercase border border-white/15 shadow-sm">
          {property.district}
        </div>

        {/* Количество фото справа */}
        {property.images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white px-2 py-1 rounded-xl text-[10px] font-medium border border-white/15">
            📷 {property.images.length}
          </div>
        )}

        {/* Цена поверх картинки снизу */}
        <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
          <div className="text-lg font-black tracking-tight drop-shadow-md">
            ${property.priceUSD} <span className="text-[11px] font-normal opacity-90">/ мес</span>
          </div>
          <div className="text-[10px] font-medium bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
            ${pricePerSquareMeter} / м²
          </div>
        </div>
      </div>

      {/* Текстовая информация */}
      <div className="p-3.5 flex flex-col flex-grow justify-between bg-[var(--tg-theme-bg-color,#ffffff)]">
        <div>
          <h3 className="text-xs font-bold line-clamp-1 text-[var(--tg-theme-text-color,#000000)] tracking-tight">
            {property.rooms}-комн. кв., {property.area} м²
          </h3>
          <p className="text-[11px] text-[var(--tg-theme-hint-color,#8e8e93)] mt-1 line-clamp-1 font-normal">
            {property.address}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[var(--tg-theme-hint-color,#8e8e93)]/10 text-[10px] text-[var(--tg-theme-hint-color,#8e8e93)]">
          <span className="font-medium">Этаж {property.floor} из {property.totalFloors}</span>
          <span className="font-semibold text-[var(--tg-theme-button-color,#2481cc)]">Без комиссии</span>
        </div>
      </div>
    </div>
  );
};