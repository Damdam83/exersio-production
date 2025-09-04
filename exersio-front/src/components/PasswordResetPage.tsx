import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ExersioLogo } from './ExersioLogo';
import { apiService } from '../services/api';

export function PasswordResetPage() {
  const [status, setStatus] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Extraire le token de l'URL
  const urlParams = new URLSearchParams(location.search);
  const token = urlParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Token de réinitialisation manquant ou invalide');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!password || !confirmPassword) {
      setError('Tous les champs sont requis');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!token) {
      setError('Token de réinitialisation invalide');
      return;
    }

    try {
      setStatus('loading');
      const response = await apiService.post('/auth/reset-password', {
        token,
        newPassword: password
      });

      setStatus('success');
      setMessage(response.message || 'Mot de passe réinitialisé avec succès !');
      
      // Rediriger vers la connexion après 3 secondes
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (err: any) {
      console.error('Erreur de réinitialisation:', err);
      setStatus('error');
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la réinitialisation du mot de passe';
      setError(errorMessage);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'form':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-white">
                Nouveau mot de passe
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#283544] border-[#3d4a5c] text-white placeholder:text-gray-400 focus:border-[#00d4aa] focus:ring-[#00d4aa]"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                Confirmer le mot de passe
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#283544] border-[#3d4a5c] text-white placeholder:text-gray-400 focus:border-[#00d4aa] focus:ring-[#00d4aa]"
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/40 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-300 font-medium">{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009775] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[#00d4aa]/30"
            >
              Réinitialiser le mot de passe
            </Button>
          </form>
        );

      case 'loading':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white">Réinitialisation en cours...</p>
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
              <h3 className="text-lg font-semibold text-white mb-2">Mot de passe réinitialisé !</h3>
              <p className="text-gray-300 text-sm mb-4">{message}</p>
              <p className="text-gray-400 text-xs">Redirection vers la connexion...</p>
            </div>
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
              <h3 className="text-lg font-semibold text-white mb-2">Erreur</h3>
              <p className="text-red-300 text-sm mb-4">{error}</p>
            </div>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009775] text-white"
            >
              Retour à la connexion
            </Button>
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
              Réinitialiser le mot de passe
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              Choisissez un nouveau mot de passe sécurisé
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {renderContent()}
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-[#00d4aa] hover:text-[#00b894] transition-colors duration-200 underline-offset-4 hover:underline"
            >
              Retour à la connexion
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}