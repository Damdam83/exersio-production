import React from 'react';
import { ChevronLeft, Plus } from 'lucide-react';

interface HeaderAction {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

interface MobileHeaderProps {
  title: string;
  icon?: string;
  onBack?: () => void;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  actionLabel?: string;
  showBack?: boolean;
  actions?: HeaderAction[];
}

export function MobileHeader({ 
  title,
  icon,
  onBack, 
  onAction, 
  actionIcon = <Plus size={20} />, 
  actionLabel = "Ajouter",
  showBack = false,
  actions 
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/20 p-4">
      <div className="flex items-center justify-between">
        {/* Bouton retour ou espace vide */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBack && onBack && (
            <button
              onClick={onBack}
              onTouchStart={() => {}} // Fix for Android touch events
              style={{ WebkitTapHighlightColor: 'transparent' }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Retour"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
          )}
          
          {/* Titre avec icon et ellipsis */}
          <h1 className="text-xl font-bold text-white truncate flex items-center gap-2">
            {icon && <span>{icon}</span>}
            {title}
          </h1>
        </div>

        {/* Actions multiples ou action simple */}
        <div className="flex items-center gap-2 ml-4">
          {actions ? (
            actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                onTouchStart={() => {}} // Fix for Android touch events
                style={{ WebkitTapHighlightColor: 'transparent' }}
                disabled={action.disabled}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  action.variant === 'primary'
                    ? 'bg-[#00d4aa] hover:bg-[#00b894] text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
                aria-label={action.label}
              >
                <span>{action.icon}</span>
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ))
          ) : onAction && (
            <button
              onClick={onAction}
              onTouchStart={() => {}} // Fix for Android touch events
              style={{ WebkitTapHighlightColor: 'transparent' }}
              className="flex items-center justify-center bg-[#00d4aa] hover:bg-[#00b894] text-white w-10 h-10 rounded-full font-medium transition-colors"
              aria-label={actionLabel}
              title={actionLabel}
            >
              {actionIcon}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}