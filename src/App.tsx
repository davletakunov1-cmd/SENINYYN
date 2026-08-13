import React, { useState } from 'react';
import { Property } from './types/property';
import { MOCK_PROPERTIES } from './api/mockData';
import { CatalogPage } from './pages/CatalogPage';
import { MapPage } from './pages/MapPage';
import { AddListingPage } from './pages/AddListingPage';
import { DetailPage } from './pages/DetailPage';
import { BottomNav } from './components/BottomNav';
import { useTelegram } from './hooks/useTelegram';

type TabType = 'catalog' | 'map' | 'add';

export function App() {
  // Инициализация Telegram WebApp
  useTelegram(); 
  
  const [currentTab, setCurrentTab] = useState<TabType>('catalog');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Единый источник истины: список всех объявлений
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);

  const handleAddProperty = (newProperty: Property) => {
    // Добавляем новое объявление в начало списка
    setProperties([newProperty, ...properties]);
    // Возвращаем пользователя в каталог после успешного добавления
    setCurrentTab('catalog');
  };

  // Если выбрана конкретная квартира — показываем детальную страницу поверх всего
  if (selectedProperty) {
    return (
      <DetailPage 
        property={selectedProperty} 
        onBack={() => setSelectedProperty(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] pb-[60px]">
      {/* Рендеринг страниц с прокидыванием актуального стейта */}
      {currentTab === 'catalog' && (
        <CatalogPage 
          properties={properties} 
          onSelectProperty={setSelectedProperty} 
        />
      )}
      
      {currentTab === 'map' && (
        <MapPage 
          properties={properties} 
          onSelectProperty={setSelectedProperty} 
        />
      )}
      
      {currentTab === 'add' && (
        <AddListingPage onAddProperty={handleAddProperty} />
      )}

      {/* Нижняя навигация — всегда зафиксирована */}
      <BottomNav 
        currentTab={currentTab} 
        onTabChange={(tab) => {
          // При переключении вкладок сбрасываем выбор квартиры, если он был
          setSelectedProperty(null);
          setCurrentTab(tab);
        }} 
      />
    </div>
  );
}

export default App;