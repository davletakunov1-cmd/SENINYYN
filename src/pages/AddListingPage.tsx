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
  const { user, MainButton } = useTelegram();

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
  const [phone, setPhone] = useState('+');
  const [imageURL, setImageURL] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        zoomControl: true, // Включаем зум, чтобы можно было приближать/отдалять
      }).setView(bishkekCenter, 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Векторная метка вместо эмодзи
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
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <svg style="width: 12px; height: 12px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Вы здесь</span>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 15],
      });

      const marker = L.marker(bishkekCenter, { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setLat(lat);
        setLon(lng);

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
      });

      mapInstanceRef.current = map;

      // Принудительный пересчет размеров тайлов
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Пересчет размеров карты при изменении полноэкранного режима
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  }, [isFullscreen]);

  // Валидация
  const numFloor = Number(floor);
  const numTotalFloors = Number(totalFloors);
  const numPrice = Number(priceUSD);
  const numArea = Number(area);

  const isFloorValid = numFloor > 0 && numFloor <= numTotalFloors;
  
  // Международная валидация: от 10 до 15 цифр
  const cleanPhone = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhone.length >= 10 && cleanPhone.length <= 15;
  
  const isFieldsFilled = 
    title.trim().length >= 5 && 
    address.trim().length >= 5 && 
    numPrice > 0 && 
    numArea >= 10 && 
    isFloorValid && 
    isPhoneValid;

  // Логика отправки формы
  const handleSubmit = async () => {
    if (!isFieldsFilled || isSubmitting) return;

    setIsSubmitting(true);
    if (MainButton) {
      MainButton.showProgress();
      MainButton.setText('Публикация...');
    }

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
        latitude: lat,
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
      if (MainButton) {
        MainButton.hideProgress();
      }
    }
  };

  // Управление Telegram MainButton
  useEffect(() => {
    if (!MainButton) return;

    MainButton.setText('Опубликовать объект');

    if (isFieldsFilled && !isSubmitting) {
      MainButton.show();
      MainButton.enable();
    } else if (isSubmitting) {
      MainButton.enable();
    } else {
      MainButton.show();
      MainButton.disable();
    }

    MainButton.onClick(handleSubmit);

    return () => {
      MainButton.offClick(handleSubmit);
      MainButton.hide();
    };
  }, [isFieldsFilled, isSubmitting, title, description, priceUSD, rooms, area, floor, totalFloors, district, address, phone, imageURL, lat, lon]);

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

      <div className="space-y-4">
        {/* Интерактивная карта с кнопкой полного экрана */}
        <div>
          <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1.5">
            Кликните на карту, чтобы поставить метку дома *
          </label>
          <div 
            className={`relative w-full rounded-2xl overflow-hidden border border-black/10 shadow-inner transition-all duration-300 ${
              isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen bg-white' : 'h-[210px]'
            }`}
          >
            {/* Кнопка сворачивания/разворачивания на весь экран */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white text-black p-2.5 rounded-full shadow-lg backdrop-blur-md transition-transform active:scale-95 flex items-center justify-center"
              title={isFullscreen ? "Свернуть" : "На весь экран"}
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>

            <div ref={mapRef} className="w-full h-full z-0" />
            
            <div className="absolute bottom-3 left-3 right-3 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-2 rounded-xl text-center font-medium shadow-md">
              Координаты: {lat.toFixed(4)}, {lon.toFixed(4)} {isFullscreen && '• Нажмите на карту, чтобы выбрать точку'}
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

        {/* Загрузка фото из галереи устройства */}
        <div>
          <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1">
            Фотография объекта *
          </label>
          
          <input
            type="file"
            accept="image/*"
            id="property-image-input"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImageURL(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />

          <label 
            htmlFor="property-image-input"
            className="relative h-44 w-full rounded-2xl overflow-hidden bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] border-2 border-dashed border-[var(--tg-theme-hint-color,#8e8e93)]/30 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--tg-theme-button-color,#2481cc)] transition-colors"
          >
            {imageURL ? (
              <img 
                src={imageURL} 
                alt="Выбранное фото" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xs text-[var(--tg-theme-hint-color,#8e8e93)] flex flex-col items-center gap-1.5 p-4 text-center">
                <svg className="w-8 h-8 opacity-60 text-[var(--tg-theme-button-color,#2481cc)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-[var(--tg-theme-text-color,#000000)]">Нажмите, чтобы выбрать фото из галереи</span>
                <span>PNG, JPG или WEBP</span>
              </div>
            )}
          </label>
        </div>

        {/* Телефон */}
        <div>
          <label className="block text-xs font-semibold text-[var(--tg-theme-hint-color,#8e8e93)] mb-1">
            Телефон в международном формате *
          </label>
          <input
            type="text"
            placeholder="+996XXXXXXXXX или +7XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] text-[var(--tg-theme-text-color,#000000)] text-sm rounded-2xl px-3.5 py-3 outline-none"
          />
          {!isPhoneValid && phone.length > 2 && (
            <p className="text-[11px] text-red-500 mt-1">
              Укажите номер с кодом страны (от 10 до 15 цифр, например: +996..., +7...).
            </p>
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
      </div>
    </div>
  );
};