import { AlertTriangle, Bell, Building2, Check, Copy, Crown, Edit3, Globe, Mail, Plus, Settings, Shield, Trash2, User as UserIcon, UserPlus, Users, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { clubsService } from '../services/clubsService';
import { invitationsService } from '../services/invitationsService';
import { usersService } from '../services/usersService';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';


export function ProfilePage() {
  const { state: auth, actions: authActions } = useAuth();
  const { setCurrentPage } = useNavigation();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isCreatingClub, setIsCreatingClub] = useState(false);
  const [isInvitingUser, setIsInvitingUser] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [joinClubCode, setJoinClubCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [invitations, setInvitations] = useState<typeof import('../types').Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les invitations au montage du composant
  React.useEffect(() => {
    const loadInvitations = async () => {
      if (auth.user) {
        try {
          // Le backend filtre automatiquement par l'email du JWT, pas besoin de passer l'email
          const response = await invitationsService.list(1, 50);
          setInvitations(response?.data || []);
        } catch (error) {
          console.error(t('profile.errors.loadInvitations'), error);
          setInvitations([]);
        }
      }
    };
    loadInvitations();
  }, [auth.user]);

  if (!auth.user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">{t('profile.loading')}</p>
      </div>
    );
  }

  const [profileForm, setProfileForm] = useState({
    name: auth.user.name,
    email: auth.user.email,
  });

  const [clubForm, setClubForm] = useState({
    name: '',
    description: '',
  });

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'assistant' as 'coach' | 'assistant',
  });

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      await usersService.update(auth.user!.id, profileForm);
      authActions.updateUser(profileForm);
      setIsEditingProfile(false);
    } catch (error) {
      console.error(t('profile.errors.updateProfile'), error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClub = async () => {
    setIsLoading(true);
    try {
      const newClub = await clubsService.create({
        ...clubForm,
        ownerId: auth.user!.id,
      });
      authActions.updateClub(newClub);
      setClubForm({ name: '', description: '' });
      setIsCreatingClub(false);
    } catch (error) {
      console.error(t('profile.errors.createClub'), error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!auth.club) return;
    
    setIsLoading(true);
    try {
      await invitationsService.create({
        email: inviteForm.email,
        role: inviteForm.role,
        clubId: auth.club.id,
        invitedById: auth.user!.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      });
      setInviteForm({ email: '', role: 'assistant' });
      setIsInvitingUser(false);
    } catch (error) {
      console.error(t('profile.errors.sendInvitation'), error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToInvitation = async (invitationId: string, response: 'accepted' | 'declined') => {
    setIsLoading(true);
    try {
      // Utiliser updateStatus au lieu de respond (qui n'existe plus)
      await invitationsService.updateStatus(invitationId, response);

      // Mettre à jour la liste des invitations localement
      setInvitations(prev => prev.map(inv =>
        inv.id === invitationId ? { ...inv, status: response } : inv
      ));

      // Si acceptée, recharger le profil pour récupérer le club
      if (response === 'accepted') {
        await authActions.initialize();
      }
    } catch (error) {
      console.error(t('profile.errors.respondInvitation'), error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClub = async (inviteCode: string) => {
    setIsLoading(true);
    try {
      await clubsService.joinByCode(inviteCode);
      await authActions.initialize(); // Recharger pour récupérer le nouveau club
      setJoinClubCode('');
    } catch (error) {
      console.error(t('profile.errors.joinClub'), error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const copyInviteCode = async () => {
    if (auth.club?.inviteCode) {
      try {
        await navigator.clipboard.writeText(auth.club.inviteCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000); // Reset après 2 secondes
      } catch (error) {
        console.error(t('profile.errors.copy'), error);
      }
    }
  };

  const handleDeleteAccount = async () => {
    const deleteKeyword = currentLanguage === 'en' ? 'DELETE' : 'SUPPRIMER';
    if (deleteConfirmText !== deleteKeyword) {
      return;
    }

    setIsLoading(true);
    try {
      await usersService.deleteOwnAccount();
      // Déconnexion et redirection vers la page d'accueil
      await authActions.logout();
      setIsDeletingAccount(false);
    } catch (error) {
      console.error(t('profile.errors.deleteAccount'), error);
      alert(t('profile.errors.deleteAccountRetry'));
    } finally {
      setIsLoading(false);
    }
  };

  const pendingInvitations = (invitations || []).filter((inv) => inv.status === 'pending');

  return (
    <div style={{ 
      minHeight: '100vh',
      color: '#ffffff',
      position: 'relative'
    }}>
      {/* Background effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 15% 85%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
        zIndex: -1
      }}></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '30px'
        }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-xl flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('profile.myAccount')}</h1>
              <p className="text-gray-400">
                {t('profile.manageProfile')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">

      {/* Invitations en attente */}
      {pendingInvitations.length > 0 && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '20px',
          padding: '32px'
        }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-orange-300">
              {t('profile.pendingInvitations')} ({pendingInvitations.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-4 rounded-lg" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div>
                  <p className="font-medium text-white">{invitation.clubName}</p>
                  <p className="text-sm text-gray-300">
                    {t('profile.invitedBy', { name: invitation.invitedByName, role: invitation.role })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t('profile.expiresOn', { date: new Date(invitation.expiresAt).toLocaleDateString() })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRespondToInvitation(invitation.id, 'accepted')}
                    className="bg-gradient-to-r from-[#00d4aa] to-[#00b894]"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    {t('profile.accept')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespondToInvitation(invitation.id, 'declined')}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <X className="w-3 h-3 mr-1" />
                    {t('profile.decline')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profil utilisateur */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        padding: '32px'
      }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-xl flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">{t('profile.title')}</h2>
          </div>
          <Button variant="outline" onClick={() => setIsEditingProfile(true)} className="border-white/20 text-white hover:bg-white/10">
            <Settings className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
              <div className="w-4 h-4 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-sm flex items-center justify-center">
                <UserIcon className="w-2 h-2 text-white" />
              </div>
              Nom
            </h4>
            <p className="text-white">{auth.user.name}</p>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
              <div className="w-4 h-4 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-sm flex items-center justify-center">
                <Mail className="w-2 h-2 text-white" />
              </div>
              Email
            </h4>
            <p className="text-white">{auth.user.email}</p>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
              <div className="w-4 h-4 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-sm flex items-center justify-center">
                <Shield className="w-2 h-2 text-white" />
              </div>
              Rôle
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant={auth.user.role === 'admin' ? 'default' : 'secondary'} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {auth.user.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                {auth.user.role === 'coach' && <Shield className="w-3 h-3 mr-1" />}
                {auth.user.role}
              </Badge>
            </div>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
              <div className="w-4 h-4 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-sm flex items-center justify-center">
                <UserIcon className="w-2 h-2 text-white" />
              </div>
              Membre depuis
            </h4>
            <p className="text-white">
              {new Date(auth.user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Préférences */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        padding: '32px'
      }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-xl flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">{t('profile.preferences')}</h2>
        </div>

        {/* Sélecteur de langue */}
        <div className="mb-6">
          <h4 className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
            <div className="w-4 h-4 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-sm flex items-center justify-center">
              <Globe className="w-2 h-2 text-white" />
            </div>
            {t('profile.language')}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`p-4 rounded-xl border transition-all ${
                  currentLanguage === lang.code
                    ? 'bg-gradient-to-r from-[#00d4aa]/20 to-[#00b894]/20 border-[#00d4aa]/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <div className="font-semibold">{lang.name}</div>
                    <div className="text-xs opacity-70">{lang.code.toUpperCase()}</div>
                  </div>
                  {currentLanguage === lang.code && (
                    <Check className="w-5 h-5 ml-auto text-[#00d4aa]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gestion du club */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        padding: '32px'
      }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">{t('profile.myClub')}</h2>
          </div>
          {!auth.club && (
            <Button variant="outline" onClick={() => setIsCreatingClub(true)} className="border-white/20 text-white hover:bg-white/10">
              <Plus className="w-4 h-4 mr-2" />
              Créer un club
            </Button>
          )}
        </div>
          {auth.club ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-sm flex items-center justify-center">
                      <Users className="w-2 h-2 text-white" />
                    </div>
                    Nom du club
                  </h4>
                  <p className="text-white">{auth.club?.name}</p>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-sm flex items-center justify-center">
                      <Users className="w-2 h-2 text-white" />
                    </div>
                    Membres
                  </h4>
                  <p className="text-white">{auth.club?.members?.length ?? 0} membre(s)</p>
                </div>
                {auth.club?.description && (
                  <div className="md:col-span-2">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-sm flex items-center justify-center">
                        <UserIcon className="w-2 h-2 text-white" />
                      </div>
                      Description
                    </h4>
                    <p className="text-white">{auth.club.description}</p>
                  </div>
                )}
              </div>

              {auth.club?.inviteCode && (
                <div className="p-6 rounded-xl" style={{
                  background: 'rgba(0, 212, 170, 0.1)',
                  border: '1px solid rgba(0, 212, 170, 0.3)'
                }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-sm flex items-center justify-center">
                          <Copy className="w-2 h-2 text-white" />
                        </div>
                        Code d'invitation
                      </h4>
                      <p className="font-mono text-2xl text-[#00d4aa] font-bold">{auth.club.inviteCode}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Partagez ce code pour inviter de nouveaux membres
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={copyInviteCode} className="border-[#00d4aa]/50 text-[#00d4aa] hover:bg-[#00d4aa]/20">
                      {copiedCode ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          Copier
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {(auth.user.role === 'admin' || auth.user.role === 'coach') && (
                <Button variant="outline" onClick={() => setIsInvitingUser(true)} className="border-white/20 text-white hover:bg-white/10">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inviter un utilisateur
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-full flex items-center justify-center opacity-50">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-medium mb-2 text-white text-xl">{t('profile.noClub')}</h3>
              <p className="text-gray-400 mb-8">
                Créez un club ou rejoignez-en un avec un code d'invitation
              </p>

              <div className="space-y-6 max-w-sm mx-auto">
                <div className="flex gap-3">
                  <Input
                    placeholder="Code d'invitation"
                    value={joinClubCode}
                    onChange={(e) => setJoinClubCode(e.target.value.toUpperCase())}
                    className="uppercase bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                  <Button
                    onClick={() => {
                      if (joinClubCode.trim()) {
                        handleJoinClub(joinClubCode.trim());
                        setJoinClubCode('');
                      }
                    }}
                    disabled={!joinClubCode.trim()}
                    className="bg-gradient-to-r from-[#00d4aa] to-[#00b894]"
                  >
                    Rejoindre
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-400">ou</div>

                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500" onClick={() => setIsCreatingClub(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon club
                </Button>
              </div>
            </div>
          )}
      </div>

      {/* Section Administration (réservée aux admins) */}
      {auth.user.role === 'admin' && (
        <div style={{
          background: 'rgba(139, 69, 19, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 69, 19, 0.3)',
          borderRadius: '20px',
          padding: '32px'
        }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-amber-300">Administration</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="p-6 rounded-lg cursor-pointer transition-colors hover:bg-white/10 border border-white/20"
              onClick={() => setCurrentPage('admin-notifications')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Notifications</h3>
                  <p className="text-gray-400 text-sm">Gérer et envoyer des notifications</p>
                </div>
              </div>
            </div>
            <div
              className="p-6 rounded-lg cursor-pointer transition-colors hover:bg-white/10 border border-white/20 opacity-60"
              title="Fonctionnalité à venir"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Paramètres système</h3>
                  <p className="text-gray-400 text-sm">À venir...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone de danger - Suppression de compte (RGPD) */}
      <div style={{
        background: 'rgba(220, 38, 38, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(220, 38, 38, 0.3)',
        borderRadius: '20px',
        padding: '32px'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-red-400">Zone de danger</h2>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsDeletingAccount(true)}
            className="border-red-500/50 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer le compte
          </Button>
        </div>
      </div>

      {/* Modal pour modification du profil */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="max-w-md text-white" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px'
        }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#00d4aa] to-[#00b894] flex items-center justify-center">
                <Edit3 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold">Modifier le profil</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-gray-300">Nom</Label>
              <Input
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder-gray-400 mt-1"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder-gray-400 mt-1"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/20">
            <Button 
              variant="outline" 
              onClick={() => setIsEditingProfile(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleUpdateProfile}
              className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009775]"
            >
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour création de club */}
      <Dialog open={isCreatingClub} onOpenChange={setIsCreatingClub}>
        <DialogContent className="max-w-md text-white" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px'
        }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold">Créer un nouveau club</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-gray-300">Nom du club</Label>
              <Input
                value={clubForm.name}
                onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder-gray-400 mt-1"
                placeholder="Mon super club de volley"
              />
            </div>
            <div>
              <Label className="text-gray-300">Description (optionnelle)</Label>
              <Textarea
                value={clubForm.description}
                onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder-gray-400 mt-1 resize-none"
                placeholder="Décrivez votre club..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/20">
            <Button 
              variant="outline" 
              onClick={() => setIsCreatingClub(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateClub}
              disabled={!clubForm.name.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Créer le club
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour invitation d'utilisateur */}
      <Dialog open={isInvitingUser} onOpenChange={setIsInvitingUser}>
        <DialogContent className="max-w-md text-white" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px'
        }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#00d4aa] to-[#00b894] flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold">Inviter un utilisateur</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder-gray-400 mt-1"
                placeholder="utilisateur@email.com"
              />
            </div>
            <div>
              <Label className="text-gray-300">Rôle</Label>
              <div className="flex gap-3 mt-2">
                <Button
                  variant={inviteForm.role === 'coach' ? 'default' : 'outline'}
                  onClick={() => setInviteForm({ ...inviteForm, role: 'coach' })}
                  className={inviteForm.role === 'coach' 
                    ? 'bg-gradient-to-r from-[#00d4aa] to-[#00b894]' 
                    : 'border-white/20 text-white hover:bg-white/10'
                  }
                  size="sm"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Coach
                </Button>
                <Button
                  variant={inviteForm.role === 'assistant' ? 'default' : 'outline'}
                  onClick={() => setInviteForm({ ...inviteForm, role: 'assistant' })}
                  className={inviteForm.role === 'assistant' 
                    ? 'bg-gradient-to-r from-[#00d4aa] to-[#00b894]' 
                    : 'border-white/20 text-white hover:bg-white/10'
                  }
                  size="sm"
                >
                  <UserIcon className="w-3 h-3 mr-1" />
                  Assistant
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/20">
            <Button 
              variant="outline" 
              onClick={() => setIsInvitingUser(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSendInvitation}
              disabled={!inviteForm.email.trim()}
              className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009775]"
            >
              Envoyer l'invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour suppression de compte (RGPD) */}
      <Dialog open={isDeletingAccount} onOpenChange={setIsDeletingAccount}>
        <DialogContent className="max-w-md w-[calc(100vw-2rem)] mx-auto text-white" style={{
          background: 'rgba(220, 38, 38, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '20px'
        }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-base sm:text-lg font-semibold text-red-400">Supprimer définitivement mon compte</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
            <div className="p-3 sm:p-4 rounded-lg" style={{
              background: 'rgba(220, 38, 38, 0.2)',
              border: '1px solid rgba(220, 38, 38, 0.4)'
            }}>
              <p className="text-white text-xs sm:text-sm font-semibold mb-2">⚠️ Attention : Cette action est irréversible !</p>
              <p className="text-gray-300 text-xs sm:text-sm">
                Toutes vos données seront définitivement supprimées et ne pourront pas être récupérées :
              </p>
              <ul className="text-gray-300 text-xs sm:text-sm space-y-1 mt-2 ml-4 list-disc">
                <li>Profil et informations personnelles</li>
                <li>Exercices créés</li>
                <li>Séances d'entraînement</li>
                <li>Favoris et préférences</li>
                <li>Notifications</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 text-xs sm:text-sm">
                Pour confirmer, tapez <span className="font-mono font-bold text-red-400">SUPPRIMER</span> ci-dessous :
              </Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                className="bg-white/5 border-red-500/50 text-white placeholder-gray-400 mt-1 font-mono text-sm"
                placeholder="SUPPRIMER"
                autoComplete="off"
              />
              <p className="text-[10px] sm:text-xs text-gray-400 italic">
                Conformément au RGPD (Droit à l'oubli), cette action supprimera toutes vos données personnelles de nos serveurs.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-red-500/30">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeletingAccount(false);
                setDeleteConfirmText('');
              }}
              className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'SUPPRIMER' || isLoading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-sm"
            >
              {isLoading ? (
                <>Suppression en cours...</>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

        </div>

      </div>
    </div>
  );
}
