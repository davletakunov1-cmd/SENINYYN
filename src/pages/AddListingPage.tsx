import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { DistrictBishkek, PropertyType, Property } from '../types/property';
import { useTelegram } from '../hooks/useTelegram';
import { createListing } from '../api/listings';

interface AddListingPageProps {
  onAddProperty: (newProperty: Property) => void;
}

const DISTRICTS: DistrictBishkek[] = [
  'Свердловский район',
  'Первомайский район',
  'Октябрьский район',
  'Ленинский район',
  'Южные ворота',
  'Асанбай',
  'ЦУМ / Центр',
  'Рабочий поселок',
  'Джал',
];

export const AddListingPage: React.FC<AddListingPageProps> = ({ onAddProperty }) => {
  const { user } = useTelegram();

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
  const [phone, setPhone] = useState('+996 ');
  const [imageURL, setImageURL] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Координаты по умолчанию (центр Бишкека) и выбранный маркер
  const [lat, setLat] = useState<number>(42.8746);
  const [lon, setLon] = useState<number>(74.6122);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Инициализация мини-карты для выбора точки
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const bishkekCenter: [number, number] = [42.8746, 74.6122];

      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView(bishkekCenter, 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Ставим начальный маркер
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: var(--tg-theme-button-color, #2481cc); 
            color: white; 
            padding: 4px 10px; 
            border-radius: 10px; 
            font-weight: 800; 
            font-size: 10px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid white;
            white-space: nowrap;
          ">
            📍 Вы здесь
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 15],
      });

      const marker = L.marker(bishkekCenter, { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      // Обработка клика по карте
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setLat(lat);
        setLon(lng);

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Валидация
  const numFloor = Number(floor);
  const numTotalFloors = Number(totalFloors);
  const numPrice = Number(priceUSD);
  const numArea = Number(area);

  const isFloorValid = numFloor > 0 && numFloor <= numTotalFloors;
  const cleanPhone = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhone.length === 12;
  
  const isFieldsFilled = 
    title.trim().length >= 5 && 
    address.trim().length >= 5 && 
    numPrice > 0 && 
    numArea >= 10 && 
    isFloorValid && 
    isPhoneValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFieldsFilled || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const propertyData = {
        title: title.trim(),
        description: description.trim(),
        priceUSD: numPrice,
        rooms: Number(rooms),
        area: numArea,
        floor: numFloor,
        totalFloors: numTotalFloors,
        district,
        address: address.trim(),
        latitude: lat, // Передаем реальные координаты с клика по карте
        longitude: lon,
        type,
        images: [
          imageURL.trim() || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
        ],
        owner: {
          name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Собственник',
          phone: phone.trim(),
          telegramUsername: user?.username
        }
      };

      const newProperty = await createListing(propertyData);
      onAddProperty(newProperty);
    } catch (error) {
      console.error('Error creating listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-36 px-4 pt-4 bg-[var(--tg-theme-bg-color,#ffffff)] min-h-screen">
      <div className="mb-4">
        <h1 className="text-xl font-extrabold text-[var(--tg-theme-text-color,#000000)]">
          Добавить объект в Бишкеке
        </h1>
        <p className="text-xs text-[var(--tg-theme-hint-color,#8e8e93)] mt-0.5">
          Укажите точное положение дома на карте
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Интерактивная карта для выбора точки */}
        <div>
          <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1.5">
            Кликните на карту, чтобы поставить метку дома *
          </label>
          <div className="relative h-52 w-full rounded-2xl overflow-hidden border border-black/10 shadow-inner">
            <div ref={mapRef} className="w-full h-full z-0" />
            <div className="absolute bottom-2 left-2 right-2 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-xl text-center font-medium">
              Координаты: {lat.toFixed(4)}, {lon.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Заголовок */}
        <div>
          <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1">
            Заголовок (мин. 5 символов) *
          </label>
          <input
            type="text"
            placeholder="Например: 2-комнатная квартира в Асанбае"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-3.5 py-3 outline-none border border-transparent focus:border-[var(--tg-theme-button-color,#2481cc)] transition-colors"
          />
        </div>

        {/* Район */}
        <div>
          <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1">
            Район Бишкека *
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value as DistrictBishkek)}
            className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-3.5 py-3 outline-none"
          >
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Адрес */}
        <div>
          <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1">
            Точный адрес (улица, дом) *
          </label>
          <input
            type="text"
            placeholder="ул. Токтогула 125"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-3.5 py-3 outline-none"
          />
        </div>

        {/* Цена и комнаты */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1">
              Цена ($ USD / мес) *
            </label>
            <input
              type="number"
              placeholder="450"
              value={priceUSD}
              onChange={(e) => setPriceUSD(e.target.value)}
              className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-3.5 py-3 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1">
              Комнаты
            </label>
            <select
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-3.5 py-3 outline-none"
            >
              <option value="1">1 комната</option>
              <option value="2">2 комнаты</option>
              <option value="3">3 комнаты</option>
              <option value="4">4+ комнат</option>
            </select>
          </div>
        </div>

        {/* Площадь и этажи */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1">
              Площадь (м²) *
            </label>
            <input
              type="number"
              placeholder="45"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-3.5 py-3 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1">
              Этаж *
            </label>
            <input
              type="number"
              placeholder="3"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-3.5 py-3 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1">
              Из этажей *
            </label>
            <input
              type="number"
              placeholder="9"
              value={totalFloors}
              onChange={(e) => setTotalFloors(e.target.value)}
              className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-3.5 py-3 outline-none"
            />
          </div>
        </div>
        {!isFloorValid && floor && (
          <p className="text-[11px] text-red-500">Этаж не может превышать общее количество этажей.</p>
        )}

        {/* Ссылка на фото */}
        <div>
          <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1">
            Ссылка на фото (URL)
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={imageURL}
            onChange={(e) => setImageURL(e.target.value)}
            className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-3.5 py-3 outline-none"
          />
        </div>

        {/* Телефон */}
        <div>
          <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1">
            Телефон (+996...) *
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-3.5 py-3 outline-none"
          />
          {!isPhoneValid && phone.length > 5 && (
            <p className="text-[11px] text-red-500 mt-1">Формат: +996 и 9 цифр номера.</p>
          )}
        </div>

        {/* Описание */}
        <div>
          <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1">
            Описание условий
          </label>
          <textarea
            rows={3}
            placeholder="Депозит, коммунальные услуги..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-3.5 py-3 outline-none resize-none"
          />
        </div>

        {/* Фиксированная кнопка отправки */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isFieldsFilled || isSubmitting}
            className={`w-full py-3.5 rounded-2xl text-sm font-extrabold transition-all shadow-lg ${
              isFieldsFilled && !isSubmitting
                ? 'bg-[var(--tg-theme-button-color,#2481cc)] text-[var(--tg-theme-button-text-color,#ffffff)] active:scale-[0.98]'
                : 'bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-hint-color,#8e8e93)] opacity-60 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Публикация...' : isFieldsFilled ? 'Опубликовать объект' : 'Заполните обязательные поля (*)'}
          </button>
        </div>
      </form>
    </div>
  );
};