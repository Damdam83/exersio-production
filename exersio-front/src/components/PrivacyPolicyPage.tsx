import React from 'react';
import { ArrowLeft, Shield, Database, Lock, Users, Clock, Mail, Trash2 } from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import { useIsMobile } from '../hooks/useIsMobile';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  const isMobile = useIsMobile();

  return (
    <div className={`min-h-screen bg-slate-900 ${isMobile ? '' : 'max-w-4xl mx-auto'}`}>
      {isMobile ? (
        <MobileHeader title="Politique de confidentialité" onBack={onBack} />
      ) : (
        <div className="bg-slate-800 shadow-sm border-b border-slate-700 px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-700 rounded-full transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-white">Politique de confidentialité</h1>
          </div>
        </div>
      )}

      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h1 className="text-3xl font-bold text-white mb-2">Politique de confidentialité</h1>
          <p className="text-gray-400">Dernière mise à jour : 25 octobre 2025</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <p className="text-gray-300 leading-relaxed">
              Bienvenue dans Exersio. Nous attachons une grande importance à la protection de votre vie privée
              et de vos données personnelles. Cette politique de confidentialité explique quelles informations
              nous collectons, comment nous les utilisons et quels sont vos droits.
            </p>
          </div>

          {/* Section 1 - Données collectées */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">1. Données collectées</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Dans le cadre de l'utilisation de l'application Exersio, nous collectons les informations suivantes :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Nom</li>
              <li>Prénom</li>
              <li>Adresse e-mail</li>
            </ul>
            <p className="text-gray-400 mt-4 text-sm italic">
              Ces données sont nécessaires pour la création et la gestion de votre compte utilisateur.
            </p>
          </section>

          {/* Section 2 - Méthodes de collecte */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">2. Méthodes de collecte</h2>
            </div>
            <p className="text-gray-300">
              Les données sont fournies par vous lors de la création de votre compte au sein de l'application.
            </p>
          </section>

          {/* Section 3 - Lieu de stockage */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">3. Lieu de stockage des données</h2>
            </div>
            <p className="text-gray-300 mb-4">Vos données sont :</p>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 font-bold">🔐</span>
                <div>
                  <p className="text-gray-300 font-medium">Stockées localement sur votre appareil</p>
                  <p className="text-gray-400 text-sm">Pour le bon fonctionnement de l'application</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 font-bold">☁️</span>
                <div>
                  <p className="text-gray-300 font-medium">Hébergées sur nos serveurs sécurisés</p>
                  <p className="text-gray-400 text-sm">
                    Afin de vous permettre de vous connecter et de retrouver vos informations sur plusieurs appareils
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 - Finalités */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">4. Finalités de la collecte</h2>
            </div>
            <p className="text-gray-300 mb-4">Vos données sont utilisées uniquement pour :</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>La création et la gestion de votre compte</li>
              <li>L'accès sécurisé à votre profil et vos séances d'entraînement</li>
              <li>L'amélioration de l'expérience utilisateur au sein de l'application</li>
            </ul>
            <div className="mt-4 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="text-blue-300 font-medium m-0">
                👉 Exersio ne vend et ne loue aucune donnée personnelle à des tiers.
              </p>
            </div>
          </section>

          {/* Section 5 - Sécurité */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-white m-0">5. Sécurité</h2>
            </div>
            <p className="text-gray-300">
              Nous mettons en place des mesures techniques et organisationnelles adaptées pour protéger vos données
              contre tout accès, utilisation ou divulgation non autorisés.
            </p>
          </section>

          {/* Section 6 - Partage des données */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">6. Partage des données</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Nous ne partageons pas vos informations personnelles avec des tiers, sauf :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Lorsque la loi l'exige</li>
              <li>
                Pour des besoins strictement techniques liés à l'hébergement et au fonctionnement de l'application
                (ex. hébergeur de base de données sécurisé)
              </li>
            </ul>
            <p className="text-gray-400 mt-4 italic">
              Aucun partenaire commercial ou publicitaire n'a accès à vos données.
            </p>
          </section>

          {/* Section 7 - Durée de conservation */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">7. Durée de conservation</h2>
            </div>
            <p className="text-gray-300 mb-3">
              Vos données sont conservées aussi longtemps que votre compte est actif.
            </p>
            <p className="text-gray-300">
              Si vous supprimez votre compte, l'ensemble des données personnelles associées sera supprimé de nos
              systèmes dans un délai raisonnable (généralement sous 30 jours).
            </p>
          </section>

          {/* Section 8 - Utilisateurs majeurs */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-white m-0">8. Utilisateurs majeurs uniquement</h2>
            </div>
            <p className="text-gray-300">
              L'application Exersio est réservée aux utilisateurs majeurs et n'est pas conçue pour être utilisée
              par des mineurs.
            </p>
          </section>

          {/* Section 9 - Vos droits RGPD */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">9. Vos droits (RGPD)</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit de suppression</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition et de limitation du traitement</li>
            </ul>
            <div className="mt-4 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="text-blue-300 mb-2">Pour exercer ces droits, vous pouvez nous contacter à l'adresse suivante :</p>
              <a href="mailto:contact@exersio.app" className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>contact@exersio.app</span>
              </a>
            </div>
          </section>

          {/* Section 10 - Suppression du compte */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold text-white m-0">10. Suppression du compte</h2>
            </div>
            <p className="text-gray-300 mb-3">
              Vous pouvez à tout moment supprimer votre compte directement depuis l'application ou en nous adressant
              une demande par e-mail.
            </p>
            <p className="text-gray-300">
              Toutes les données associées seront effacées de nos serveurs dans les meilleurs délais.
            </p>
          </section>

          {/* Section 11 - Modifications */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">11. Modifications de cette politique</h2>
            </div>
            <p className="text-gray-300 mb-3">
              Cette politique de confidentialité peut être mise à jour ponctuellement. Toute modification sera publiée
              dans l'application et/ou sur notre site web.
            </p>
            <p className="text-gray-400 italic">
              La date de la dernière mise à jour figure toujours en haut de ce document.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white m-0">Contact</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Si vous avez des questions concernant cette politique de confidentialité ou la gestion de vos données,
              vous pouvez nous contacter à :
            </p>
            <a
              href="mailto:contact@exersio.app"
              className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-medium text-lg"
            >
              <Mail className="w-5 h-5" />
              <span>contact@exersio.app</span>
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};
