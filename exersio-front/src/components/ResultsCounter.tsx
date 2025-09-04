import React from 'react';

interface ResultsCounterProps {
  total: number;
  filtered?: number;
  itemType: string;
  isLoading?: boolean;
}

export function ResultsCounter({ total, filtered, itemType, isLoading = false }: ResultsCounterProps) {
  if (isLoading) {
    return (
      <div className="px-4 py-3 bg-slate-800/30 border-b border-white/5">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-4 h-4 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin"></div>
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  const displayCount = filtered !== undefined ? filtered : total;
  const showFiltered = filtered !== undefined && filtered !== total;

  return (
    <div className="px-4 py-3 bg-slate-800/30 border-b border-white/5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300">
          {displayCount === 0 ? (
            `Aucun ${itemType.toLowerCase()} trouvé`
          ) : displayCount === 1 ? (
            `1 ${itemType.toLowerCase()}`
          ) : (
            `${displayCount} ${itemType.toLowerCase()}s`
          )}
          {showFiltered && (
            <span className="text-gray-400 ml-1">sur {total}</span>
          )}
        </span>
        
        {showFiltered && (
          <span className="text-xs bg-[#00d4aa]/20 text-[#00d4aa] px-2 py-1 rounded-full">
            Filtrés
          </span>
        )}
      </div>
    </div>
  );
}