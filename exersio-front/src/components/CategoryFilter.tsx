import React, { useState } from 'react';
import { Check, ChevronDown, Filter } from 'lucide-react';
import { useCategories } from '../contexts/CategoriesContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface CategoryFilterProps {
  selectedCategoryIds: string[];
  selectedAgeCategoryIds: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  onAgeCategoriesChange: (ageCategoryIds: string[]) => void;
}

export function CategoryFilter({
  selectedCategoryIds,
  selectedAgeCategoryIds,
  onCategoriesChange,
  onAgeCategoriesChange
}: CategoryFilterProps) {
  const { state: categoriesState } = useCategories();
  const [showExerciseCategories, setShowExerciseCategories] = useState(false);
  const [showAgeCategories, setShowAgeCategories] = useState(false);

  const exerciseCategories = categoriesState.exerciseCategories.data;
  const ageCategories = categoriesState.ageCategories.data;

  const handleExerciseCategoryToggle = (categoryId: string) => {
    const newSelected = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter(id => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    onCategoriesChange(newSelected);
  };

  const handleAgeCategoryToggle = (ageCategoryId: string) => {
    const newSelected = selectedAgeCategoryIds.includes(ageCategoryId)
      ? selectedAgeCategoryIds.filter(id => id !== ageCategoryId)
      : [...selectedAgeCategoryIds, ageCategoryId];
    onAgeCategoriesChange(newSelected);
  };

  const clearAllFilters = () => {
    onCategoriesChange([]);
    onAgeCategoriesChange([]);
  };

  const totalFilters = selectedCategoryIds.length + selectedAgeCategoryIds.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#00d4aa]" />
          Filtres
          {totalFilters > 0 && (
            <Badge variant="secondary" className="bg-[#00d4aa]/20 text-[#00d4aa]">
              {totalFilters}
            </Badge>
          )}
        </h3>
        {totalFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-400 hover:text-white"
          >
            Effacer tout
          </Button>
        )}
      </div>

      {/* Filtres sélectionnés */}
      {totalFilters > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategoryIds.map(categoryId => {
            const category = exerciseCategories.find(c => c.id === categoryId);
            return category ? (
              <Badge
                key={categoryId}
                variant="secondary"
                className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-pointer hover:bg-emerald-500/30"
                onClick={() => handleExerciseCategoryToggle(categoryId)}
              >
                {category.icon} {category.name} ✕
              </Badge>
            ) : null;
          })}
          {selectedAgeCategoryIds.map(ageCategoryId => {
            const category = ageCategories.find(c => c.id === ageCategoryId);
            return category ? (
              <Badge
                key={ageCategoryId}
                variant="secondary"
                className="bg-amber-500/20 text-amber-400 border-amber-500/30 cursor-pointer hover:bg-amber-500/30"
                onClick={() => handleAgeCategoryToggle(ageCategoryId)}
              >
                {category.name} ✕
              </Badge>
            ) : null;
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Catégories d'exercice */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between text-left p-3 h-auto hover:bg-white/5"
            onClick={() => setShowExerciseCategories(!showExerciseCategories)}
          >
            <span className="font-medium">Catégories d'exercice</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showExerciseCategories ? 'rotate-180' : ''}`} />
          </Button>
          
          {showExerciseCategories && (
            <div className="space-y-1 pl-3">
              {categoriesState.exerciseCategories.isLoading && (
                <div className="text-gray-400 text-sm">Chargement...</div>
              )}
              {exerciseCategories.map(category => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedCategoryIds.includes(category.id)}
                      onChange={() => handleExerciseCategoryToggle(category.id)}
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedCategoryIds.includes(category.id)
                        ? 'bg-[#00d4aa] border-[#00d4aa]'
                        : 'border-gray-500 hover:border-gray-400'
                    }`}>
                      {selectedCategoryIds.includes(category.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm" style={{ color: category.color || '#ffffff' }}>
                    {category.icon} {category.name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Catégories d'âge */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between text-left p-3 h-auto hover:bg-white/5"
            onClick={() => setShowAgeCategories(!showAgeCategories)}
          >
            <span className="font-medium">Catégories d'âge</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAgeCategories ? 'rotate-180' : ''}`} />
          </Button>
          
          {showAgeCategories && (
            <div className="space-y-1 pl-3">
              {categoriesState.ageCategories.isLoading && (
                <div className="text-gray-400 text-sm">Chargement...</div>
              )}
              {ageCategories.map(category => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedAgeCategoryIds.includes(category.id)}
                      onChange={() => handleAgeCategoryToggle(category.id)}
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedAgeCategoryIds.includes(category.id)
                        ? 'bg-[#00d4aa] border-[#00d4aa]'
                        : 'border-gray-500 hover:border-gray-400'
                    }`}>
                      {selectedAgeCategoryIds.includes(category.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm">
                    {category.name}
                    {category.minAge && category.maxAge && (
                      <span className="text-gray-400 ml-1">
                        ({category.minAge}-{category.maxAge} ans)
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}