import React, { useState, useEffect } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { Progress } from './ui/progress';
import { 
  Loader2, 
  Upload, 
  RefreshCw, 
  Zap, 
  Target,
  Play,
  Users,
  Calendar,
  FileText
} from 'lucide-react';

const DynamicLoader: React.FC = () => {
  const { isLoading, loadingRequests } = useLoading();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState('');

  // Messages amusants pour le volleyball
  const funMessages = [
    "🏐 Préparation du terrain...",
    "🏃‍♂️ Échauffement des joueurs...",
    "📋 Organisation de l'équipe...",
    "🎯 Calibrage des attaques...",
    "🤾‍♀️ Réglage du filet...",
    "⚡ Activation du mode turbo...",
    "🏆 Préparation de la victoire...",
    "📊 Analyse des statistiques...",
    "🎪 Mise en place du spectacle...",
    "🔥 Ignition du terrain...",
  ];

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % funMessages.length);
      setAnimationClass('animate-pulse');
      setTimeout(() => setAnimationClass(''), 500);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading, funMessages.length]);

  const getIcon = (type?: string) => {
    switch (type) {
      case 'upload':
        return <Upload className="w-6 h-6" />;
      case 'sync':
        return <RefreshCw className="w-6 h-6 animate-spin" />;
      case 'processing':
        return <Zap className="w-6 h-6" />;
      default:
        return <Loader2 className="w-6 h-6 animate-spin" />;
    }
  };

  const getContextIcon = () => {
    const icons = [Target, Play, Users, Calendar, FileText];
    const IconComponent = icons[currentMessageIndex % icons.length];
    return <IconComponent className="w-4 h-4 mr-2" />;
  };

  if (!isLoading) return null;

  const primaryRequest = loadingRequests[0];
  const hasProgress = primaryRequest?.progress !== undefined;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
        {/* Icône principale animée */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-ping"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-4">
              {getIcon(primaryRequest?.type)}
            </div>
          </div>
        </div>

        {/* Message principal */}
        {primaryRequest?.message && (
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {primaryRequest.message}
            </h3>
          </div>
        )}

        {/* Barre de progression */}
        {hasProgress && (
          <div className="mb-4">
            <Progress 
              value={primaryRequest.progress} 
              className="w-full h-3"
            />
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              {primaryRequest.progress}%
            </div>
          </div>
        )}

        {/* Message amusant qui change */}
        <div className={`text-center transition-all duration-500 ${animationClass}`}>
          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            {getContextIcon()}
            {funMessages[currentMessageIndex]}
          </div>
        </div>

        {/* Points animés */}
        <div className="flex justify-center space-x-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>

        {/* Requêtes multiples */}
        {loadingRequests.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {loadingRequests.length} tâches en cours...
            </div>
            <div className="mt-2 space-y-1">
              {loadingRequests.slice(1, 4).map((request, index) => (
                <div key={request.id} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                  {request.message || 'Chargement...'}
                </div>
              ))}
              {loadingRequests.length > 4 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  +{loadingRequests.length - 4} autres...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicLoader;