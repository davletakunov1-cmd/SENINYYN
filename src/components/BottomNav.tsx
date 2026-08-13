import React from 'react';

type TabType = 'catalog' | 'map' | 'add';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'catalog', label: 'Каталог', icon: '⌂' },
    { id: 'map', label: 'Карта', icon: '◎' },
    { id: 'add', label: 'Сдать', icon: '＋' },
  ] as const;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <div className="bg-[var(--tg-theme-secondary-bg-color,#ffffff)]/85 backdrop-blur-xl border border-[var(--tg-theme-hint-color,#999999)]/15 px-2 py-1.5 rounded-2xl shadow-2xl flex items-center gap-1 w-full max-w-md">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-[var(--tg-theme-button-color,#2481cc)] text-[var(--tg-theme-button-text-color,#ffffff)] shadow-md shadow-[var(--tg-theme-button-color,#2481cc)]/25 scale-[1.02]'
                  : 'text-[var(--tg-theme-hint-color,#708499)] hover:text-[var(--tg-theme-text-color,#000000)]'
              }`}
            >
              <span className="text-sm font-light">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};