import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  requirements: PasswordRequirement[];
}

/**
 * Calcule la force d'un mot de passe et retourne le score avec les exigences
 */
function calculatePasswordStrength(password: string): PasswordStrength {
  const requirements: PasswordRequirement[] = [
    {
      label: 'Au moins 8 caractères',
      met: password.length >= 8
    },
    {
      label: 'Une lettre majuscule',
      met: /[A-Z]/.test(password)
    },
    {
      label: 'Une lettre minuscule',
      met: /[a-z]/.test(password)
    },
    {
      label: 'Un chiffre',
      met: /[0-9]/.test(password)
    },
    {
      label: 'Un caractère spécial (!@#$%^&*)',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ];

  const metCount = requirements.filter(req => req.met).length;

  let score = 0;
  let label = 'Très faible';
  let color = 'bg-red-500';

  if (metCount === 0) {
    score = 0;
    label = 'Très faible';
    color = 'bg-red-500';
  } else if (metCount === 1 || metCount === 2) {
    score = 1;
    label = 'Faible';
    color = 'bg-orange-500';
  } else if (metCount === 3) {
    score = 2;
    label = 'Moyen';
    color = 'bg-yellow-500';
  } else if (metCount === 4) {
    score = 3;
    label = 'Fort';
    color = 'bg-lime-500';
  } else if (metCount === 5) {
    score = 4;
    label = 'Très fort';
    color = 'bg-green-500';
  }

  return { score, label, color, requirements };
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  // Ne rien afficher si le mot de passe est vide
  if (!password) {
    return null;
  }

  const strength = calculatePasswordStrength(password);

  return (
    <div className="mt-2 space-y-2">
      {/* Barre de force visuelle */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(strength.score / 4) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-slate-300 min-w-[80px]">
          {strength.label}
        </span>
      </div>

      {/* Liste des exigences */}
      <div className="space-y-1">
        {strength.requirements.map((requirement, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-xs"
          >
            {requirement.met ? (
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <X className="w-4 h-4 text-slate-500 flex-shrink-0" />
            )}
            <span className={requirement.met ? 'text-green-400' : 'text-slate-400'}>
              {requirement.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
