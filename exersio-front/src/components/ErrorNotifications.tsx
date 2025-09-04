import React from 'react';
import { useError } from '../contexts/ErrorContext';
import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ErrorNotifications: React.FC = () => {
  const { errors, dismissError } = useError();

  if (errors.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle style={{ width: '18px', height: '18px' }} />;
      case 'warning':
        return <AlertTriangle style={{ width: '18px', height: '18px' }} />;
      case 'info':
        return <Info style={{ width: '18px', height: '18px' }} />;
      default:
        return <AlertCircle style={{ width: '18px', height: '18px' }} />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'error':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.4)',
          text: '#ffffff',
          icon: '#ef4444'
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.4)',
          text: '#ffffff',
          icon: '#f59e0b'
        };
      case 'info':
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          border: 'rgba(59, 130, 246, 0.4)',
          text: '#ffffff',
          icon: '#3b82f6'
        };
      default:
        return {
          bg: 'rgba(107, 114, 128, 0.15)',
          border: 'rgba(107, 114, 128, 0.4)',
          text: '#ffffff',
          icon: '#6b7280'
        };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      maxWidth: '420px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {errors.map((error) => {
        const colors = getColors(error.type);
        return (
          <div
            key={error.id}
            style={{
              background: colors.bg,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                color: colors.icon,
                flexShrink: 0,
                marginTop: '2px'
              }}>
                {getIcon(error.type)}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: '4px'
                }}>
                  {error.type === 'error' ? 'Erreur' : 
                   error.type === 'warning' ? 'Attention' : 'Information'}
                </div>
                
                <div style={{
                  fontSize: '13px',
                  color: colors.text,
                  lineHeight: '1.4',
                  opacity: 0.8
                }}>
                  {error.message}
                </div>

                {error.details && (
                  <details style={{ marginTop: '8px' }}>
                    <summary style={{
                      cursor: 'pointer',
                      fontSize: '11px',
                      color: colors.text,
                      opacity: 0.7,
                      userSelect: 'none'
                    }}>
                      Détails techniques
                    </summary>
                    <pre style={{
                      fontSize: '10px',
                      marginTop: '6px',
                      padding: '8px',
                      background: 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '6px',
                      overflow: 'auto',
                      maxHeight: '80px',
                      color: colors.text,
                      opacity: 0.7,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {error.details}
                    </pre>
                  </details>
                )}
              </div>
              
              <button
                onClick={() => dismissError(error.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.text,
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6,
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '0.6';
                  e.currentTarget.style.background = 'none';
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        );
      })}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @media (max-width: 480px) {
            div[style*="position: fixed"][style*="right: 20px"] {
              right: 10px !important;
              left: 10px !important;
              max-width: none !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default ErrorNotifications;