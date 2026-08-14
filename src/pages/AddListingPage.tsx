import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { DistrictBishkek, PropertyType, Property } from '../types/property';
import { useTelegram } from '../hooks/useTelegram';
import { createListing } from '../api/listings';

interface AddListingPageProps {
  onAddProperty: (newProperty: Property) => void;
  onBack: () => void;
}

const DISTRICTS: DistrictBishkek[] = [
  'Свердловский район', 'Первомайский район', 'Октябрьский район',
  'Ленинский район', 'Южные ворота', 'Асанбай', 'ЦУМ / Центр',
  'Рабочий поселок', 'Джал',
];

export const AddListingPage: React.FC<AddListingPageProps> = ({ onAddProperty, onBack }) => {
  const { user, MainButton } = useTelegram();

  // Состояния
  const [phone, setPhone] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(true);

  // Остальные поля
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceUSD, setPriceUSD] = useState('');
  const [rooms, setRooms] = useState('1');
  const [area, setArea] = useState('');
  const [floor, setFloor] = useState('1');
  const [totalFloors, setTotalFloors] = useState('5');
  const [district, setDistrict] = useState<DistrictBishkek>('Асанбай');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<PropertyType>('apartment');
  const [imageURL, setImageURL] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [lat, setLat] = useState<number>(42.8746);
  const [lon, setLon] = useState<number>(74.6122);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Инициализация получения телефона
  useEffect(() => {
    const fetchVerifiedPhone = async () => {
      try {
        const initData = window.Telegram?.WebApp?.initData || '';
        const response = await fetch('http://localhost:3000/api/get-phone', {
          headers: { 'x-telegram-init-data': initData }
        });
        const data = await response.json();

        if (data.verified && data.phone) {
          setPhone(data.phone);
          setIsVerified(true);
        }
      } catch (e) {
        console.error('Ошибка получения телефона:', e);
      } finally {
        setLoadingPhone(false);
      }
    };
    fetchVerifiedPhone();
  }, []);

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  // Инициализация карты
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([42.8746, 74.6122], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
      
      const marker = L.marker([42.8746, 74.6122]).addTo(map);
      markerRef.current = marker;

      map.on('click', (e: L.LeafletMouseEvent) => {
        setLat(e.latlng.lat);
        setLon(e.latlng.lng);
        marker.setLatLng(e.latlng);
      });
      mapInstanceRef.current = map;
    }
  }, []);

  const isFieldsFilled = title.length >= 5 && isVerified && Number(priceUSD) > 0;

  const handleSubmit = async () => {
    if (!isFieldsFilled || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const propertyData = {
        title, description, priceUSD: Number(priceUSD), rooms: Number(rooms),
        area: Number(area), floor: Number(floor), totalFloors: Number(totalFloors),
        district, address, latitude: lat, longitude: lon, type,
        images: [imageURL || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
        owner: { name: user?.first_name || 'Собственник', phone, telegramUsername: user?.username }
      };
      const newProperty = await createListing(propertyData);
      onAddProperty(newProperty);
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="pb-36 px-4 pt-4 bg-[var(--tg-theme-bg-color,#ffffff)] min-h-screen">
      
      {/* Кнопка назад */}
      <button onClick={onBack} className="mb-4 text-sm text-[var(--tg-theme-button-color,#2481cc)] font-medium">
        ← Назад к списку
      </button>

      <h1 className="text-xl font-bold mb-4 text-[var(--tg-theme-text-color,#000000)]">Создать объявление</h1>

      {/* Название */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1.5 uppercase">Заголовок *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: 2-комнатная квартира, 60 м²"
          className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-4 py-3.5 outline-none"
        />
      </div>

      {/* Блок верификации телефона */}
      <div className="mt-6 mb-4">
        <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1.5 uppercase">
          Телефон (подтвержден через Telegram) *
        </label>
        
        <input
          type="text"
          value={loadingPhone ? 'Загрузка...' : (isVerified ? phone : 'Требуется верификация')}
          disabled
          className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-4 py-3.5 opacity-80 cursor-not-allowed"
        />

        {isVerified ? (
          <p className="text-[11px] text-emerald-600 mt-1.5 font-medium">✓ Номер подтвержден и защищен.</p>
        ) : (
          <div className="mt-2 text-xs text-[var(--tg-theme-hint-color,#8e8e93)] bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] p-3 rounded-2xl">
            Чтобы опубликовать, перейдите в <b><a href="https://t.me/ТВОЙ_БОТ" target="_blank" rel="noreferrer" className="text-blue-500 underline">Telegram-бота</a></b> и подтвердите номер.
          </div>
        )}
      </div>

      {/* Цена */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1.5 uppercase">Цена ($ в месяц) *</label>
        <input
          type="number"
          value={priceUSD}
          onChange={(e) => setPriceUSD(e.target.value)}
          placeholder="500"
          className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-4 py-3.5 outline-none"
        />
      </div>

      {/* Кнопка отправки */}
      <button
        onClick={handleSubmit}
        disabled={!isFieldsFilled || isSubmitting}
        className={`w-full py-4 rounded-2xl font-semibold text-white mt-6 transition-all ${
          isFieldsFilled && !isSubmitting 
            ? 'bg-[var(--tg-theme-button-color,#2481cc)] opacity-100 cursor-pointer' 
            : 'bg-gray-400 opacity-50 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Публикация...' : 'Опубликовать объявление'}
      </button>

    </div>
  );
};