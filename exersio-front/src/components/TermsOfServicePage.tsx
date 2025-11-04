import React from 'react';
import { ArrowLeft, FileText, Users, Shield, AlertTriangle, Scale, Clock } from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import { useIsMobile } from '../hooks/useIsMobile';

interface TermsOfServicePageProps {
  onBack: () => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onBack }) => {
  const isMobile = useIsMobile();

  return (
    <div className={`min-h-screen bg-slate-900 ${isMobile ? '' : 'max-w-4xl mx-auto'}`}>
      {isMobile ? (
        <MobileHeader title="Conditions Générales d'Utilisation" onBack={onBack} />
      ) : (
        <div className="bg-slate-800 shadow-sm border-b border-slate-700 px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-700 rounded-full transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-white">Conditions Générales d'Utilisation</h1>
          </div>
        </div>
      )}

      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h1 className="text-3xl font-bold text-white mb-2">Conditions Générales d'Utilisation</h1>
          <p className="text-gray-400">Dernière mise à jour : 25 octobre 2025</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <p className="text-gray-300 leading-relaxed">
              Bienvenue sur Exersio. En utilisant notre application, vous acceptez les présentes Conditions Générales
              d'Utilisation (CGU). Veuillez les lire attentivement.
            </p>
          </div>

          {/* Section 1 - Objet */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">1. Objet</h2>
            </div>
            <p className="text-gray-300">
              Les présentes Conditions Générales d'Utilisation (ci-après "CGU") ont pour objet de définir les modalités
              et conditions d'utilisation de l'application mobile Exersio (ci-après "l'Application"), ainsi que les
              droits et obligations des utilisateurs.
            </p>
          </section>

          {/* Section 2 - Acceptation */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-white m-0">2. Acceptation des CGU</h2>
            </div>
            <p className="text-gray-300 mb-3">
              L'utilisation de l'Application implique l'acceptation pleine et entière des présentes CGU.
            </p>
            <p className="text-gray-300">
              Si vous n'acceptez pas ces conditions, vous devez cesser immédiatement toute utilisation de l'Application.
            </p>
          </section>

          {/* Section 3 - Description du service */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">3. Description du service</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Exersio est une application destinée aux entraîneurs sportifs pour la gestion et la planification
              de séances d'entraînement. Elle permet notamment de :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Créer et organiser des exercices sportifs</li>
              <li>Planifier des séances d'entraînement</li>
              <li>Partager des exercices au sein d'un club</li>
              <li>Gérer un historique de séances</li>
              <li>Recevoir des notifications de rappel</li>
            </ul>
          </section>

          {/* Section 4 - Inscription et compte utilisateur */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">4. Inscription et compte utilisateur</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4.1 Conditions d'inscription</h3>
                <p className="text-gray-300">
                  L'utilisation de l'Application nécessite la création d'un compte utilisateur. En vous inscrivant,
                  vous déclarez être majeur et capable de souscrire un contrat.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4.2 Exactitude des informations</h3>
                <p className="text-gray-300">
                  Vous vous engagez à fournir des informations exactes, complètes et à jour lors de votre inscription.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4.3 Sécurité du compte</h3>
                <p className="text-gray-300">
                  Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute activité
                  effectuée depuis votre compte est présumée avoir été réalisée par vous.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 - Utilisation acceptable */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-white m-0">5. Utilisation acceptable</h2>
            </div>
            <p className="text-gray-300 mb-4">Vous vous engagez à ne pas :</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Utiliser l'Application à des fins illégales ou non autorisées</li>
              <li>Tenter de contourner les mesures de sécurité de l'Application</li>
              <li>Diffuser du contenu offensant, diffamatoire ou portant atteinte aux droits d'autrui</li>
              <li>Collecter ou stocker des données personnelles d'autres utilisateurs sans leur consentement</li>
              <li>Utiliser l'Application de manière à surcharger les serveurs ou entraver son bon fonctionnement</li>
            </ul>
            <div className="mt-4 bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
              <p className="text-yellow-300 font-medium m-0">
                ⚠️ Toute violation de ces règles peut entraîner la suspension ou la suppression de votre compte.
              </p>
            </div>
          </section>

          {/* Section 6 - Propriété intellectuelle */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">6. Propriété intellectuelle</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">6.1 Droits sur l'Application</h3>
                <p className="text-gray-300">
                  L'Application, son contenu, ses fonctionnalités et tous les éléments qui la composent (textes, images,
                  graphiques, logos, code source) sont la propriété exclusive d'Exersio et sont protégés par les lois
                  sur la propriété intellectuelle.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">6.2 Contenu utilisateur</h3>
                <p className="text-gray-300">
                  Vous conservez tous les droits sur le contenu que vous créez (exercices, séances). En partageant
                  du contenu au sein d'un club, vous accordez aux membres de ce club le droit de consulter et utiliser
                  ce contenu.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7 - Responsabilités */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-white m-0">7. Limitation de responsabilité</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">7.1 Disponibilité du service</h3>
                <p className="text-gray-300">
                  Nous nous efforçons d'assurer la disponibilité continue de l'Application, mais nous ne pouvons
                  garantir un accès ininterrompu. Des interruptions peuvent survenir pour maintenance ou raisons
                  techniques.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">7.2 Contenu créé par les utilisateurs</h3>
                <p className="text-gray-300">
                  Exersio ne saurait être tenu responsable du contenu créé et partagé par les utilisateurs. Chaque
                  utilisateur est seul responsable des exercices et séances qu'il crée.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">7.3 Pratique sportive</h3>
                <p className="text-gray-300">
                  L'Application est un outil de planification. Exersio n'est pas responsable des blessures ou dommages
                  pouvant résulter de la pratique d'exercices créés via l'Application.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8 - Données personnelles */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">8. Protection des données personnelles</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Le traitement de vos données personnelles est régi par notre Politique de Confidentialité, qui fait
              partie intégrante des présentes CGU.
            </p>
            <p className="text-gray-300">
              Nous collectons et traitons vos données conformément au Règlement Général sur la Protection des Données
              (RGPD) et aux lois applicables.
            </p>
          </section>

          {/* Section 9 - Modifications */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">9. Modifications des CGU</h2>
            </div>
            <p className="text-gray-300 mb-3">
              Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications entreront
              en vigueur dès leur publication dans l'Application.
            </p>
            <p className="text-gray-300">
              En continuant à utiliser l'Application après la publication des modifications, vous acceptez les nouvelles
              CGU. La date de dernière mise à jour est indiquée en haut de ce document.
            </p>
          </section>

          {/* Section 10 - Résiliation */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold text-white m-0">10. Résiliation</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">10.1 Par l'utilisateur</h3>
                <p className="text-gray-300">
                  Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'Application.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">10.2 Par Exersio</h3>
                <p className="text-gray-300">
                  Nous nous réservons le droit de suspendre ou supprimer votre compte en cas de violation des présentes
                  CGU, sans préavis ni indemnité.
                </p>
              </div>
            </div>
          </section>

          {/* Section 11 - Droit applicable */}
          <section className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white m-0">11. Droit applicable et juridiction</h2>
            </div>
            <p className="text-gray-300 mb-3">
              Les présentes CGU sont régies par le droit français.
            </p>
            <p className="text-gray-300">
              En cas de litige relatif à l'interprétation ou l'exécution des présentes CGU, et à défaut d'accord
              amiable, les tribunaux français seront seuls compétents.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white m-0">Contact</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Pour toute question concernant ces Conditions Générales d'Utilisation, vous pouvez nous contacter à :
            </p>
            <a
              href="mailto:contact@exersio.app"
              className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-medium text-lg"
            >
              <FileText className="w-5 h-5" />
              <span>contact@exersio.app</span>
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};
