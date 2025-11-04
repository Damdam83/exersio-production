import React, { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  id?: string; // ID unique pour les clés React (évite les doublons entre sports)
}

interface MobileFiltersProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }>;
  showSearch?: boolean;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function MobileFilters({
  searchValue = '',
  onSearchChange,
  filters = [],
  showSearch = true,
  onResetFilters,
  hasActiveFilters = false
}: MobileFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const activeFiltersCount = filters.filter(f => f.value && f.value !== 'all').length;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-white/10">
      {/* Barre de recherche et bouton filtres */}
      <div className="p-4 space-y-3">
        {showSearch && onSearchChange && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent"
            />
          </div>
        )}

        {/* Bouton filtres avec compteur */}
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full p-3 bg-slate-700/50 border border-white/10 rounded-lg text-white hover:bg-slate-700/70 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter size={20} />
              <span>Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#00d4aa] text-slate-900 px-2 py-1 rounded-full text-xs font-medium">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <div className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Panel des filtres */}
      {showFilters && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/10">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                {filter.label}
              </label>
              
              {/* Boutons filtres horizontaux */}
              <div className="flex flex-wrap gap-2">
                {filter.options.map((option) => (
                  <button
                    key={option.id || option.value}
                    onClick={() => filter.onChange(option.value)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                      filter.value === option.value
                        ? 'bg-[#00d4aa] text-slate-900'
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700/70'
                    }`}
                  >
                    {option.label}
                    {option.count !== undefined && (
                      <span className="ml-1 opacity-75">({option.count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Bouton réinitialiser (si filtres actifs) */}
          {hasActiveFilters && onResetFilters && (
            <button
              onClick={() => {
                onResetFilters();
                setShowFilters(false);
              }}
              className="w-full mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <X size={16} />
              Réinitialiser les filtres
            </button>
          )}

          {/* Bouton pour fermer les filtres */}
          <button
            onClick={() => setShowFilters(false)}
            className="w-full mt-2 p-3 bg-slate-700/50 border border-white/10 rounded-lg text-gray-300 hover:bg-slate-700/70 transition-colors flex items-center justify-center gap-2"
          >
            <X size={16} />
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}