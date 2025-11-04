import { Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/useIsMobile';
import { api } from '../services/api';
import { getSports } from '../services/sportsApi';
import type { Sport } from '../types';
import type { ApiError } from '../types/api';
import { ExersioLogo } from './ExersioLogo';
import { LegalFooter } from './LegalFooter';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface AuthFormProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onRegister?: (data: { name: string; email: string; password: string; preferredSportId?: string }) => Promise<void>;
  isLoading?: boolean;
  error?: ApiError | string | null;
}

type AuthMode = 'login' | 'register' | 'forgot-password' | 'confirm-email' | 'reset-password';

export function AuthForm({ onLogin, onRegister, isLoading = false, error }: AuthFormProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preferredSportId, setPreferredSportId] = useState<string>('');
  const [sports, setSports] = useState<Sport[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');
  const urlAction = urlParams.get('action');

  // Handle URL parameters on component mount
  useEffect(() => {
    if (urlToken) {
      if (urlAction === 'reset-password') {
        setMode('reset-password');
      } else {
        setMode('confirm-email');
        handleEmailConfirmation(urlToken);
      }
    }
  }, [urlToken, urlAction]);

  // Load sports when switching to register mode
  useEffect(() => {
    if (mode === 'register' && sports.length === 0) {
      console.log('Loading sports for registration...');
      getSports()
        .then(data => {
          console.log('Sports loaded:', data);
          setSports(data);
        })
        .catch(err => console.error('Failed to load sports:', err));
    }
  }, [mode]);

  // Nettoyer les erreurs et messages quand l'utilisateur tape
  React.useEffect(() => {
    if (localError) {
      setLocalError(null);
    }
    if (successMessage) {
      setSuccessMessage(null);
    }
  }, [email, password, name, confirmPassword]);

  const handleEmailConfirmation = async (token: string) => {
    try {
      setIsProcessing(true);
      setLocalError(null);
      const response = await api.get(`/auth/confirm-email?token=${encodeURIComponent(token)}`);
      
      if (response.user && response.token) {
        // Connecter automatiquement l'utilisateur
        // Nous devons créer une méthode pour cela dans AuthContext
        setSuccessMessage('Email confirmé avec succès ! Vous êtes maintenant connecté. Redirection...');
        
        // Simuler la connexion automatique après confirmation
        setTimeout(() => {
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          // Reload to trigger authentication
          window.location.reload();
        }, 2000);
      } else {
        setSuccessMessage('Email confirmé avec succès !');
      }
    } catch (err: any) {
      console.error('Erreur de confirmation email:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la confirmation de l\'email';
      setLocalError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (mode === 'forgot-password') {
      // Mode mot de passe oublié
      if (!email) {
        setLocalError('Email requis');
        return;
      }

      try {
        const response = await api.post('/auth/forgot-password', { email });
        setSuccessMessage(response.message || 'Un lien de réinitialisation a été envoyé à votre email.');
      } catch (err: any) {
        console.error('Erreur mot de passe oublié:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'envoi de l\'email';
        setLocalError(errorMessage);
      }
    } else if (mode === 'reset-password') {
      // Mode réinitialisation mot de passe
      if (!password || !confirmPassword) {
        setLocalError('Tous les champs sont requis');
        return;
      }

      if (password !== confirmPassword) {
        setLocalError('Les mots de passe ne correspondent pas');
        return;
      }

      // Validation de la force du mot de passe
      if (password.length < 8) {
        setLocalError('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setLocalError('Le mot de passe doit contenir au moins une lettre majuscule');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setLocalError('Le mot de passe doit contenir au moins une lettre minuscule');
        return;
      }
      if (!/[0-9]/.test(password)) {
        setLocalError('Le mot de passe doit contenir au moins un chiffre');
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        setLocalError('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)');
        return;
      }

      if (!urlToken) {
        setLocalError('Token de réinitialisation invalide');
        return;
      }

      try {
        const response = await api.post('/auth/reset-password', {
          token: urlToken,
          newPassword: password
        });

        setSuccessMessage('Mot de passe réinitialisé avec succès ! Redirection vers la connexion...');
        
        setTimeout(() => {
          // Clear URL parameters and return to login
          window.history.replaceState({}, document.title, window.location.pathname);
          setMode('login');
          setPassword('');
          setConfirmPassword('');
          setEmail('');
        }, 2000);
      } catch (err: any) {
        console.error('Erreur de réinitialisation:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la réinitialisation du mot de passe';
        setLocalError(errorMessage);
      }
    } else if (mode === 'register') {
      // Validation pour l'inscription
      if (!name || !email || !password || !confirmPassword) {
        setLocalError('Tous les champs sont requis');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Les mots de passe ne correspondent pas');
        return;
      }

      // Validation de la force du mot de passe
      if (password.length < 8) {
        setLocalError('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setLocalError('Le mot de passe doit contenir au moins une lettre majuscule');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setLocalError('Le mot de passe doit contenir au moins une lettre minuscule');
        return;
      }
      if (!/[0-9]/.test(password)) {
        setLocalError('Le mot de passe doit contenir au moins un chiffre');
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        setLocalError('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)');
        return;
      }

      if (!acceptTerms || !acceptPrivacy) {
        setLocalError('Vous devez accepter les CGU et la Politique de Confidentialité pour créer un compte');
        return;
      }
      if (!onRegister) {
        setLocalError('Fonction d\'inscription non disponible');
        return;
      }

      try {
        const result = await onRegister({
          name,
          email,
          password,
          preferredSportId: preferredSportId || undefined
        });
        // Si l'inscription réussit, afficher un message de succès
        setSuccessMessage('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
      } catch (err: any) {
        console.error('Erreur d\'inscription:', err);
        // Afficher l'erreur à l'utilisateur
        const errorMessage = err.message || 'Une erreur est survenue lors de l\'inscription';
        setLocalError(errorMessage);
      }
    } else {
      // Mode connexion (login)
      if (!email || !password) {
        setLocalError('Email et mot de passe requis');
        return;
      }

      try {
        await onLogin({ email, password });
      } catch (err) {
        console.error('Erreur de connexion:', err);
      }
    }
  };

  const displayError = (typeof error === 'string' ? error : error?.message) || localError;

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
              {mode === 'confirm-email' ? 'Confirmation d\'email' : 
               mode === 'reset-password' ? 'Nouveau mot de passe' :
               mode === 'forgot-password' ? 'Mot de passe oublié' : 
               mode === 'register' ? 'Créer un compte' : 'Bienvenue sur Exersio'}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              {mode === 'confirm-email' ? 'Vérification de votre adresse email en cours...' :
               mode === 'reset-password' ? 'Choisissez un nouveau mot de passe sécurisé' :
               mode === 'forgot-password' ? 'Saisissez votre email pour recevoir un lien de réinitialisation' : 
               mode === 'register' ? 'Rejoignez la communauté Exersio' : 'Connectez-vous à votre espace d\'entraînement'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {mode === 'confirm-email' ? (
            // Mode confirmation email - affichage statique
            <div className="text-center space-y-4">
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-white">Confirmation de votre email en cours...</p>
                </div>
              ) : successMessage ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Email confirmé !</h3>
                    <p className="text-gray-300 text-sm">{successMessage}</p>
                  </div>
                </div>
              ) : localError ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Erreur de confirmation</h3>
                    <p className="text-red-300 text-sm">{localError}</p>
                  </div>
                  <Button
                    onClick={() => {
                      window.history.replaceState({}, document.title, window.location.pathname);
                      setMode('login');
                    }}
                    className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009775] text-white"
                  >
                    Retour à la connexion
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Champ nom (uniquement en mode inscription) */}
              {mode === 'register' && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-white">
                      Nom complet
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom complet"
                      disabled={isLoading}
                      className="bg-[#283544] border-[#3d4a5c] text-white placeholder:text-gray-400 focus:border-[#00d4aa] focus:ring-[#00d4aa]"
                      autoComplete="name"
                      required={mode === 'register'}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="preferredSport" className="text-sm font-medium text-white">
                      Sport préféré (optionnel)
                    </label>
                    <select
                      id="preferredSport"
                      value={preferredSportId}
                      onChange={(e) => setPreferredSportId(e.target.value)}
                      disabled={isLoading || !sports || sports.length === 0}
                      className="w-full px-3 py-2 bg-[#283544] border border-[#3d4a5c] rounded-md text-white focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] focus:outline-none"
                      style={{
                        WebkitAppearance: 'menulist',
                        MozAppearance: 'menulist',
                        appearance: 'menulist'
                      }}
                    >
                      <option value="">-- Sélectionner un sport --</option>
                      {sports && Array.isArray(sports) && sports.length > 0 ? (
                        sports.map(sport => (
                          <option key={sport.id} value={sport.id}>
                            {sport.icon ? `${sport.icon} ` : ''}{sport.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>Chargement des sports...</option>
                      )}
                    </select>
                    {(!sports || sports.length === 0) && mode === 'register' && (
                      <p className="text-xs text-gray-400">Chargement des sports...</p>
                    )}
                  </div>
                </>
              )}
            
            {/* Champ email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@exersio.com"
                disabled={isLoading}
                className="bg-[#283544] border-[#3d4a5c] text-white placeholder:text-gray-400 focus:border-[#00d4aa] focus:ring-[#00d4aa]"
                autoComplete="email"
                required
              />
            </div>

            {/* Champ mot de passe (pas en mode forgot password) */}
            {mode !== 'forgot-password' && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white">
                  {mode === 'reset-password' ? 'Nouveau mot de passe' : 'Mot de passe'}
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="bg-[#283544] border-[#3d4a5c] text-white placeholder:text-gray-400 focus:border-[#00d4aa] focus:ring-[#00d4aa] pr-10"
                    autoComplete={mode === 'reset-password' ? 'new-password' : 'current-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {/* Indicateur de force de mot de passe - uniquement en mode inscription et reset */}
                {(mode === 'register' || mode === 'reset-password') && (
                  <PasswordStrengthIndicator password={password} />
                )}
              </div>
            )}

            {/* Champ confirmation mot de passe (en mode inscription et reset-password) */}
            {(mode === 'register' || mode === 'reset-password') && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="bg-[#283544] border-[#3d4a5c] text-white placeholder:text-gray-400 focus:border-[#00d4aa] focus:ring-[#00d4aa] pr-10"
                    autoComplete="new-password"
                    required={mode === 'register' || mode === 'reset-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* RGPD Checkboxes - uniquement en mode register */}
            {mode === 'register' && (
              <div className="space-y-3 pt-2">
                {/* CGU */}
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-700 text-[#00d4aa] focus:ring-2 focus:ring-[#00d4aa] focus:ring-offset-0 cursor-pointer"
                      required
                    />
                  </div>
                  <span className="text-sm text-gray-300 leading-snug flex-1">
                    J'accepte les{' '}
                    <button
                      type="button"
                      onClick={() => window.open('/terms', '_blank')}
                      className="text-[#00d4aa] hover:text-[#00b894] underline font-medium"
                    >
                      Conditions Générales d'Utilisation
                    </button>
                  </span>
                </label>

                {/* Politique de confidentialité */}
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                    <input
                      type="checkbox"
                      checked={acceptPrivacy}
                      onChange={(e) => setAcceptPrivacy(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-700 text-[#00d4aa] focus:ring-2 focus:ring-[#00d4aa] focus:ring-offset-0 cursor-pointer"
                      required
                    />
                  </div>
                  <span className="text-sm text-gray-300 leading-snug flex-1">
                    J'accepte la{' '}
                    <button
                      type="button"
                      onClick={() => window.open('/privacy', '_blank')}
                      className="text-[#00d4aa] hover:text-[#00b894] underline font-medium"
                    >
                      Politique de Confidentialité
                    </button>
                  </span>
                </label>
              </div>
            )}

            {/* Affichage des erreurs */}
            {displayError && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/40 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-300 font-medium">{displayError}</p>
                </div>
              </div>
            )}

            {/* Affichage des messages de succès */}
            {successMessage && (
              <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/40 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-300 font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Bouton de connexion */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009775] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[#00d4aa]/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'reset-password' ? 'Réinitialisation...' :
                   mode === 'forgot-password' ? 'Envoi...' : 
                   mode === 'register' ? 'Inscription...' : 'Connexion...'}
                </div>
              ) : (
                mode === 'reset-password' ? 'Réinitialiser le mot de passe' :
                mode === 'forgot-password' ? 'Envoyer le lien' : 
                mode === 'register' ? 'Créer un compte' : 'Se connecter'
              )}
            </Button>
            </form>
          )}

          {/* Liens de navigation */}
          <div className="mt-4 text-center space-y-2">
            {(mode === 'login' || mode === 'register') && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'register' ? 'login' : 'register');
                    setLocalError(null);
                    setSuccessMessage(null);
                    setName('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-sm text-[#00d4aa] hover:text-[#00b894] transition-colors duration-200 underline-offset-4 hover:underline block w-full"
                  disabled={isLoading}
                >
                  {mode === 'register'
                    ? 'Vous avez déjà un compte ? Connectez-vous' 
                    : 'Pas encore de compte ? Créez-en un'
                  }
                </button>
                
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password');
                      setLocalError(null);
                      setSuccessMessage(null);
                      setPassword('');
                    }}
                    className="text-xs text-gray-400 hover:text-[#00d4aa] transition-colors duration-200 underline-offset-4 hover:underline"
                    disabled={isLoading}
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </>
            )}
            
            {(mode === 'forgot-password' || mode === 'reset-password') && (
              <button
                type="button"
                onClick={() => {
                  window.history.replaceState({}, document.title, window.location.pathname);
                  setMode('login');
                  setLocalError(null);
                  setSuccessMessage(null);
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm text-[#00d4aa] hover:text-[#00b894] transition-colors duration-200 underline-offset-4 hover:underline"
                disabled={isLoading}
              >
                Retour à la connexion
              </button>
            )}
          </div>
          {/* Footer avec liens légaux */}
          <LegalFooter className="mt-6" />
        </CardContent>
      </Card>
    </div>
  );
}
