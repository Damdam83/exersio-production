import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ExersioLogo } from './ExersioLogo';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { ApiError } from '../types/api';

export function EmailConfirmationPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resending'>('loading');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { actions: authActions } = useAuth();

  // Extraire le token de l'URL
  const urlParams = new URLSearchParams(location.search);
  const token = urlParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Token de confirmation manquant ou invalide');
      return;
    }

    confirmEmail(token);
  }, [token]);

  const confirmEmail = async (confirmToken: string) => {
    try {
      setStatus('loading');
      const response = await apiService.get(`/auth/confirm-email?token=${encodeURIComponent(confirmToken)}`);
      
      if (response.user && response.token) {
        // Connecter automatiquement l'utilisateur
        await authActions.setAuthData(response.user, response.token);
        setStatus('success');
        setMessage('Email confirmé avec succès ! Vous êtes maintenant connecté.');
        
        // Rediriger vers l'application après 3 secondes
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setStatus('success');
        setMessage(response.message || 'Email confirmé avec succès !');
      }
    } catch (err: any) {
      console.error('Erreur de confirmation email:', err);
      setStatus('error');
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la confirmation de l\'email';
      setError(errorMessage);
    }
  };

  const handleResendConfirmation = async () => {
    // Pour renvoyer un email de confirmation, on a besoin de l'adresse email
    // On peut la demander à l'utilisateur ou la récupérer depuis l'état auth
    const email = prompt('Veuillez saisir votre adresse email pour recevoir un nouveau lien de confirmation :');
    
    if (!email) return;

    try {
      setStatus('resending');
      await apiService.post('/auth/resend-confirmation', { email });
      setMessage('Un nouveau lien de confirmation a été envoyé à votre adresse email.');
      setError(null);
    } catch (err: any) {
      console.error('Erreur lors du renvoi:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du renvoi de l\'email';
      setError(errorMessage);
      setStatus('error');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white">Confirmation de votre email en cours...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Email confirmé !</h3>
              <p className="text-gray-300 text-sm">{message}</p>
            </div>
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009775] text-white"
            >
              Accéder à l'application
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Erreur de confirmation</h3>
              <p className="text-red-300 text-sm mb-4">{error}</p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleResendConfirmation}
                variant="outline"
                className="w-full border-[#00d4aa] text-[#00d4aa] hover:bg-[#00d4aa] hover:text-white"
              >
                Renvoyer l'email de confirmation
              </Button>
              <Button
                onClick={() => navigate('/auth')}
                className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009775] text-white"
              >
                Retour à la connexion
              </Button>
            </div>
          </div>
        );

      case 'resending':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white">Renvoi de l'email de confirmation...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2731] via-[#2a3441] to-[#1e2731] flex items-center justify-center p-4 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #00d4aa 2px, transparent 2px),
                              radial-gradient(circle at 75% 75%, #00d4aa 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <Card className="relative z-10 w-full max-w-md glass-strong border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <ExersioLogo className="h-12 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-[#00d4aa] to-[#00b894] bg-clip-text text-transparent">
              Confirmation d'email
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              Vérification de votre adresse email
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}