import React from 'react';

export const PropertySkeleton: React.FC = () => {
  return (
    <div className="bg-[var(--tg-theme-secondary-bg-color,#f4f4f6)] rounded-[24px] overflow-hidden flex flex-col border border-black/5 animate-pulse">
      {/* Заглушка картинки */}
      <div className="relative h-48 w-full bg-gray-300 dark:bg-gray-700" />

      {/* Заглушка текста */}
      <div className="p-3.5 flex flex-col flex-grow justify-between bg-[var(--tg-theme-bg-color,#ffffff)] space-y-3">
        <div>
          <div className="h-3.5 bg-gray-300 dark:bg-gray-700 rounded-md w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/2" />
        </div>

        <div className="pt-2.5 border-t border-[var(--tg-theme-hint-color,#8e8e93)]/10 flex items-center justify-between">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/4" />
        </div>
      </div>
    </div>
  );
};