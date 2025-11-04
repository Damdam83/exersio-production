import React from 'react';

interface LegalFooterProps {
  className?: string;
  textColor?: string;
}

export const LegalFooter: React.FC<LegalFooterProps> = ({
  className = '',
  textColor = 'text-gray-500'
}) => {
  const handleLinkClick = (path: string) => {
    // Ouvrir dans un nouvel onglet
    window.open(path, '_blank');
  };

  return (
    <footer className={`text-center space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => handleLinkClick('/privacy')}
          className={`${textColor} hover:text-[#00d4aa] transition-colors underline-offset-4 hover:underline`}
        >
          Politique de confidentialité
        </button>
        <span className={textColor}>•</span>
        <button
          type="button"
          onClick={() => handleLinkClick('/terms')}
          className={`${textColor} hover:text-[#00d4aa] transition-colors underline-offset-4 hover:underline`}
        >
          CGU
        </button>
        <span className={textColor}>•</span>
        <a
          href="mailto:contact@exersio.app"
          className={`${textColor} hover:text-[#00d4aa] transition-colors underline-offset-4 hover:underline`}
        >
          Contact
        </a>
      </div>
      <p className={`text-xs ${textColor}`}>
        © 2025 Exersio - Plateforme d'entraînement sportif
      </p>
    </footer>
  );
};
