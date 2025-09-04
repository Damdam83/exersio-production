import React from 'react';
import { SportType, SPORTS_CONFIG } from '../constants/sportsConfig';

interface SportSelectionModalProps {
  isOpen: boolean;
  onSelect: (sport: SportType) => void;
  onClose: () => void;
}

export function SportSelectionModal({ isOpen, onSelect, onClose }: SportSelectionModalProps) {
  if (!isOpen) return null;

  const handleSportSelect = (sport: SportType) => {
    onSelect(sport);
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#ffffff',
              margin: 0,
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              🏟️ Choisir un sport
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#94a3b8',
              margin: 0
            }}>
              Sélectionnez le type de terrain pour votre exercice
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            '@media (max-width: 768px)': {
              gridTemplateColumns: '1fr',
              gap: '16px'
            }
          }}>
            {Object.values(SPORTS_CONFIG).map((sport) => (
              <div
                key={sport.id}
                onClick={() => handleSportSelect(sport.id)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '2px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  minHeight: '280px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#00d4aa';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 212, 170, 0.3)';
                  e.currentTarget.style.background = 'rgba(0, 212, 170, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                {/* Terrain miniature */}
                <div style={{
                  width: '100%',
                  height: '120px',
                  background: sport.fieldColor,
                  borderRadius: '12px',
                  marginBottom: '20px',
                  position: 'relative',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {/* Pattern de terrain spécifique */}
                  {sport.fieldPattern === 'grass' && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 8px,
                        rgba(255, 255, 255, 0.1) 8px,
                        rgba(255, 255, 255, 0.1) 10px
                      )`
                    }} />
                  )}
                  
                  {/* Éléments spécifiques du terrain */}
                  {sport.specificElements?.net && (
                    <div style={{
                      position: 'absolute',
                      top: '45%',
                      left: '0',
                      right: '0',
                      height: '2px',
                      background: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '1px'
                    }} />
                  )}
                  
                  {sport.specificElements?.goals && (
                    <>
                      <div style={{
                        position: 'absolute',
                        left: '4px',
                        top: '30%',
                        bottom: '30%',
                        width: '8px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '2px'
                      }} />
                      <div style={{
                        position: 'absolute',
                        right: '4px',
                        top: '30%',
                        bottom: '30%',
                        width: '8px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '2px'
                      }} />
                    </>
                  )}

                  {sport.specificElements?.baskets && (
                    <>
                      <div style={{
                        position: 'absolute',
                        left: '8px',
                        top: '20px',
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%'
                      }} />
                      <div style={{
                        position: 'absolute',
                        right: '8px',
                        bottom: '20px',
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%'
                      }} />
                    </>
                  )}

                  {/* Emoji du sport */}
                  <div style={{
                    fontSize: '32px',
                    opacity: 0.8,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
                  }}>
                    {sport.emoji}
                  </div>
                </div>

                {/* Informations du sport */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#ffffff',
                      margin: '0 0 8px 0'
                    }}>
                      {sport.name}
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      color: '#94a3b8',
                      margin: '0 0 16px 0',
                      lineHeight: '1.4'
                    }}>
                      {sport.description}
                    </p>
                  </div>

                  {/* Statistiques */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#94a3b8'
                  }}>
                    <span>👥 {sport.minPlayers}-{sport.maxPlayers}</span>
                    <span>🎯 {Object.keys(sport.playerRoles).length} rôles</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message d'aide */}
          <div style={{
            marginTop: '24px',
            padding: '16px 20px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#60a5fa',
              margin: 0,
              lineHeight: '1.4'
            }}>
              💡 Chaque sport propose un éditeur de terrain spécialisé avec ses propres rôles de joueurs et éléments tactiques
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}