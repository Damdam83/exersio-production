import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Helper pour créer un slug depuis un nom
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper pour extraire min/max age depuis une string comme "10–11 ans" ou "≤7 ans"
function parseAgeRange(ageStr: string): { minAge: number | null; maxAge: number | null } {
  // "≤7 ans" -> max 7
  if (ageStr.startsWith('≤')) {
    const max = parseInt(ageStr.match(/\d+/)?.[0] || '0');
    return { minAge: null, maxAge: max };
  }

  // "22 ans et +" -> min 22
  if (ageStr.includes(' et +') || ageStr.includes('ans et +')) {
    const min = parseInt(ageStr.match(/\d+/)?.[0] || '0');
    return { minAge: min, maxAge: null };
  }

  // "8–9 ans" ou "8-9 ans" -> min 8, max 9
  const matches = ageStr.match(/(\d+)[–-](\d+)/);
  if (matches) {
    return { minAge: parseInt(matches[1]), maxAge: parseInt(matches[2]) };
  }

  // "selon fédération" -> null
  return { minAge: null, maxAge: null };
}

async function main() {
  console.log('🌱 Starting seed...');

  // Lire le fichier JSON
  const jsonPath = path.join(__dirname, '../../exersio_categories_age_sport.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // Mapping des noms de sports vers leurs icônes et slugs
  const sportsConfig = {
    'Volley-ball': { slug: 'volleyball', icon: '🏐', order: 1 },
    'Football': { slug: 'football', icon: '⚽', order: 2 },
    'Basketball': { slug: 'basketball', icon: '🏀', order: 3 },
    'Handball': { slug: 'handball', icon: '🤾', order: 4 },
    'Tennis': { slug: 'tennis', icon: '🎾', order: 5 }
  };

  // Catégories d'exercices par sport
  const exerciseCategories = {
    volleyball: [
      { slug: 'attaque', name: 'Attaque', icon: '⚔️', color: '#ef4444', order: 1 },
      { slug: 'defense', name: 'Défense', icon: '🛡️', color: '#3b82f6', order: 2 },
      { slug: 'service', name: 'Service', icon: '🎯', color: '#10b981', order: 3 },
      { slug: 'reception', name: 'Réception', icon: '📥', color: '#f59e0b', order: 4 },
      { slug: 'contre', name: 'Contre', icon: '🚫', color: '#8b5cf6', order: 5 },
      { slug: 'echauffement', name: 'Échauffement', icon: '🔥', color: '#ec4899', order: 6 }
    ],
    football: [
      { slug: 'technique', name: 'Technique', icon: '⚽', color: '#10b981', order: 1 },
      { slug: 'tactique', name: 'Tactique', icon: '🧠', color: '#3b82f6', order: 2 },
      { slug: 'physique', name: 'Physique', icon: '💪', color: '#ef4444', order: 3 },
      { slug: 'gardien', name: 'Gardien de but', icon: '🧤', color: '#f59e0b', order: 4 },
      { slug: 'echauffement', name: 'Échauffement', icon: '🔥', color: '#ec4899', order: 5 }
    ],
    basketball: [
      { slug: 'tir', name: 'Tir', icon: '🎯', color: '#ef4444', order: 1 },
      { slug: 'dribble', name: 'Dribble', icon: '🏀', color: '#10b981', order: 2 },
      { slug: 'defense', name: 'Défense', icon: '🛡️', color: '#3b82f6', order: 3 },
      { slug: 'passe', name: 'Passe', icon: '🤝', color: '#f59e0b', order: 4 },
      { slug: 'rebond', name: 'Rebond', icon: '↕️', color: '#8b5cf6', order: 5 },
      { slug: 'echauffement', name: 'Échauffement', icon: '🔥', color: '#ec4899', order: 6 }
    ],
    handball: [
      { slug: 'attaque', name: 'Attaque', icon: '⚔️', color: '#ef4444', order: 1 },
      { slug: 'defense', name: 'Défense', icon: '🛡️', color: '#3b82f6', order: 2 },
      { slug: 'gardien', name: 'Gardien', icon: '🧤', color: '#f59e0b', order: 3 },
      { slug: 'tir', name: 'Tir', icon: '🎯', color: '#10b981', order: 4 },
      { slug: 'echauffement', name: 'Échauffement', icon: '🔥', color: '#ec4899', order: 5 }
    ],
    tennis: [
      { slug: 'service', name: 'Service', icon: '🎯', color: '#10b981', order: 1 },
      { slug: 'coup-droit', name: 'Coup droit', icon: '➡️', color: '#ef4444', order: 2 },
      { slug: 'revers', name: 'Revers', icon: '⬅️', color: '#3b82f6', order: 3 },
      { slug: 'volee', name: 'Volée', icon: '🏐', color: '#f59e0b', order: 4 },
      { slug: 'tactique', name: 'Tactique', icon: '🧠', color: '#8b5cf6', order: 5 },
      { slug: 'echauffement', name: 'Échauffement', icon: '🔥', color: '#ec4899', order: 6 }
    ]
  };

  // Créer les sports
  for (const [sportName, config] of Object.entries(sportsConfig)) {
    const sport = await prisma.sport.upsert({
      where: { slug: config.slug },
      update: {},
      create: {
        name: sportName,
        slug: config.slug,
        icon: config.icon,
        order: config.order
      }
    });
    console.log(`✅ Sport créé: ${sportName} (${sport.id})`);

    // Créer les catégories d'exercices pour ce sport
    const sportExerciseCategories = exerciseCategories[config.slug as keyof typeof exerciseCategories];
    for (const category of sportExerciseCategories) {
      await prisma.exerciseCategory.upsert({
        where: { slug_sportId: { slug: category.slug, sportId: sport.id } },
        update: {},
        create: {
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          color: category.color,
          order: category.order,
          sportId: sport.id
        }
      });
    }
    console.log(`  ✅ ${sportExerciseCategories.length} catégories d'exercices créées`);

    // Créer les catégories d'âge pour ce sport
    const ageCategories = jsonData[sportName];
    for (let i = 0; i < ageCategories.length; i++) {
      const ageCat = ageCategories[i];
      const slug = slugify(ageCat.categorie);
      const { minAge, maxAge } = parseAgeRange(ageCat.age);

      await prisma.ageCategory.upsert({
        where: { slug_sportId: { slug, sportId: sport.id } },
        update: {},
        create: {
          name: ageCat.categorie,
          slug,
          minAge,
          maxAge,
          order: i + 1,
          sportId: sport.id
        }
      });
    }
    console.log(`  ✅ ${ageCategories.length} catégories d'âge créées\n`);
  }

  console.log('🎉 Seed terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
