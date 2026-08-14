import React, { useState } from 'react';
import { Property } from './types/property';
import { MOCK_PROPERTIES } from './api/mockData';
import { CatalogPage } from './pages/CatalogPage';
import { AddListingPage } from './pages/AddListingPage';
import { DetailPage } from './pages/DetailPage';
import { useTelegram } from './hooks/useTelegram';

type ScreenType = 'catalog' | 'add';

export function App() {
  // Инициализация Telegram WebApp
  useTelegram(); 
  
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('catalog');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Единый источник истины: список всех объявлений
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);

  const handleAddProperty = (newProperty: Property) => {
    // Добавляем новое объявление в начало списка
    setProperties([newProperty, ...properties]);
    // Возвращаем пользователя в каталог после успешного добавления
    setCurrentScreen('catalog');
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
    <div className="min-h-screen bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)]">
      {/* Рендеринг экранов без нижнего меню */}
      {currentScreen === 'catalog' && (
        <CatalogPage 
          properties={properties} 
          onSelectProperty={setSelectedProperty} 
          onNavigateToAdd={() => setCurrentScreen('add')}
        />
      )}
      
      {currentScreen === 'add' && (
        <AddListingPage onAddProperty={handleAddProperty} />
      )}
    </div>
  );
}

export default App;