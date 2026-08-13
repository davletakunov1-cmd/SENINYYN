import React, { useEffect } from 'react';
import { Property } from '../types/property';
import { useTelegram } from '../hooks/useTelegram';

interface DetailPageProps {
  property: Property;
  onBack: () => void;
}

export const DetailPage: React.FC<DetailPageProps> = ({ property, onBack }) => {
  const { BackButton, tg } = useTelegram();

  // Управляем нативной кнопкой "Назад" в Telegram
  useEffect(() => {
    BackButton.show();
    BackButton.onClick(onBack);

    return () => {
      BackButton.hide();
      BackButton.offClick(onBack);
    };
  }, [BackButton, onBack]);

  const handleContact = () => {
    if (property.owner.telegramUsername) {
      // Открываем чат с собственником в Telegram
      tg?.openTelegramLink(`https://t.me/${property.owner.telegramUsername}`);
    } else {
      // Если юзернейма нет, инициируем звонок
      window.location.href = `tel:${property.owner.phone}`;
    }
  };

  const pricePerSquareMeter = Math.round(property.priceUSD / property.area);

  return (
    <div className="pb-28 bg-[var(--tg-theme-bg-color,#ffffff)] min-h-screen">
      {/* Галерея изображений */}
      <div className="relative h-72 w-full bg-gray-200">
        <img 
          src={property.images[0]} 
          alt={property.title} 
          className="w-full h-full object-cover"
        />
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 bg-black/60 text-white px-3.5 py-2 rounded-xl backdrop-blur-md text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Назад</span>
        </button>
        <div className="absolute bottom-3 right-3 bg-[var(--tg-theme-button-color,#2481cc)] text-[var(--tg-theme-button-text-color,#ffffff)] px-3.5 py-1.5 rounded-2xl text-sm font-extrabold shadow-lg">
          ${property.priceUSD} <span className="text-xs font-normal opacity-90">/ мес</span>
        </div>
      </div>

      <div className="p-4">
        {/* Район и заголовок */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--tg-theme-button-color,#2481cc)] uppercase tracking-wider">
            {property.district}
          </span>
          <span className="text-[11px] text-[var(--tg-theme-hint-color,#999999)]">
            Опубликовано: {property.createdAt}
          </span>
        </div>

        <h1 className="text-lg font-extrabold text-[var(--tg-theme-text-color,#000000)] mt-1">
          {property.title}
        </h1>
        <div className="flex items-center gap-1 text-xs text-[var(--tg-theme-hint-color,#999999)] mt-1">
          <svg className="w-3.5 h-3.5 text-[var(--tg-theme-button-color,#2481cc)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{property.address}</span>
        </div>

        {/* Характеристики (сетка в стиле ЦИАН) */}
        <div className="grid grid-cols-4 gap-2 my-4 bg-[var(--tg-theme-secondary-bg-color,#efeff3)] p-3 rounded-2xl text-center">
          <div>
            <div className="text-[10px] text-[var(--tg-theme-hint-color,#999999)]">Комнаты</div>
            <div className="text-sm font-bold mt-0.5">{property.rooms}</div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--tg-theme-hint-color,#999999)]">Площадь</div>
            <div className="text-sm font-bold mt-0.5">{property.area} м²</div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--tg-theme-hint-color,#999999)]">Этаж</div>
            <div className="text-sm font-bold mt-0.5">{property.floor}/{property.totalFloors}</div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--tg-theme-hint-color,#999999)]">Цена за м²</div>
            <div className="text-sm font-bold mt-0.5">${pricePerSquareMeter}</div>
          </div>
        </div>

        {/* Описание */}
        <div className="mb-6">
          <h2 className="text-sm font-extrabold text-[var(--tg-theme-text-color,#000000)] mb-1.5">
            Описание объекта
          </h2>
          <p className="text-xs text-[var(--tg-theme-text-color,#000000)]/80 leading-relaxed whitespace-pre-line bg-[var(--tg-theme-secondary-bg-color,#efeff3)] p-3.5 rounded-2xl">
            {property.description || 'Описание от собственника отсутствует.'}
          </p>
        </div>

        {/* Блок контактов собственника */}
        <div className="bg-[var(--tg-theme-secondary-bg-color,#efeff3)] p-4 rounded-2xl flex items-center justify-between border border-[var(--tg-theme-hint-color,#999999)]/10">
          <div>
            <div className="text-[10px] text-[var(--tg-theme-hint-color,#999999)] uppercase tracking-wider font-semibold">Собственник</div>
            <div className="text-sm font-extrabold mt-0.5">{property.owner.name}</div>
            <div className="text-xs text-[var(--tg-theme-text-color,#000000)]/70 mt-0.5">{property.owner.phone}</div>
          </div>
          <button
            onClick={handleContact}
            className="bg-[var(--tg-theme-button-color,#2481cc)] text-[var(--tg-theme-button-text-color,#ffffff)] px-5 py-3 rounded-xl text-xs font-extrabold active:scale-95 transition-transform shadow-md"
          >
            Связаться
          </button>
        </div>
      </div>
    </div>
  );
};