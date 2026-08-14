import React from 'react';

export const PropertySkeleton: React.FC = () => {
  return (
    <div className="bg-[var(--tg-theme-secondary-bg-color,#ffffff)] rounded-[24px] overflow-hidden flex flex-col border border-[var(--tg-theme-hint-color,#999999)]/10 animate-pulse">
      {/* Заглушка картинки */}
      <div className="relative h-56 w-full bg-gray-200 dark:bg-gray-800" />

      {/* Заглушка текста */}
      <div className="p-4 flex flex-col justify-between flex-grow bg-[var(--tg-theme-bg-color,#ffffff)] space-y-4">
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2" />
        </div>

        <div className="pt-3 border-t border-[var(--tg-theme-hint-color,#8e8e93)]/10 flex items-center justify-between">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4" />
        </div>
      </div>
    </div>
  );
};