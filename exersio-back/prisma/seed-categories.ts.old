import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
  console.log('🌱 Seeding categories...');
  
  // Seeder les catégories d'exercice
  const exerciseCategories = [
    { name: 'Échauffement', slug: 'echauffement', color: '#10B981', icon: '🔥', order: 1 },
    { name: 'Jeu', slug: 'jeu', color: '#3B82F6', icon: '🎮', order: 2 },
    { name: 'Attaque', slug: 'attaque', color: '#EF4444', icon: '⚔️', order: 3 },
    { name: 'Défense', slug: 'defense', color: '#8B5CF6', icon: '🛡️', order: 4 },
    { name: 'Réception', slug: 'reception', color: '#F59E0B', icon: '📥', order: 5 },
    { name: 'Service', slug: 'service', color: '#06B6D4', icon: '🎯', order: 6 },
    { name: 'Contre', slug: 'contre', color: '#EC4899', icon: '🚫', order: 7 },
    { name: 'Autres', slug: 'autres', color: '#6B7280', icon: '📋', order: 8 }
  ];

  // Seeder les catégories d'âge
  const ageCategories = [
    { name: 'Tous', slug: 'tous', minAge: null, maxAge: null, order: 1 },
    { name: 'Enfants', slug: 'enfants', minAge: 6, maxAge: 12, order: 2 },
    { name: 'Jeunes', slug: 'jeunes', minAge: 13, maxAge: 17, order: 3 },
    { name: 'Séniors', slug: 'seniors', minAge: 18, maxAge: null, order: 4 }
  ];

  // Créer les catégories d'exercice
  for (const category of exerciseCategories) {
    await prisma.exerciseCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }

  // Créer les catégories d'âge
  for (const category of ageCategories) {
    await prisma.ageCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }

  console.log('✅ Categories seeded successfully!');
  
  // Maintenant migrer les exercices existants
  console.log('🔄 Migrating existing exercises...');
  
  const exercises = await prisma.exercise.findMany();
  
  for (const exercise of exercises) {
    // Trouver la catégorie correspondante
    let categoryId = null;
    let ageCategoryId = null;
    
    // Mapper les anciennes catégories vers les nouvelles
    const categoryMapping: Record<string, string> = {
      'échauffement': 'echauffement',
      'jeu': 'jeu',
      'attaque': 'attaque',
      'défense': 'defense',
      'defense': 'defense', // variante
      'réception': 'reception',
      'reception': 'reception', // variante
      'service': 'service',
      'contre': 'contre',
      'autres': 'autres'
    };
    
    const ageCategoryMapping: Record<string, string> = {
      'tous': 'tous',
      'enfants': 'enfants',
      'jeunes': 'jeunes',
      'séniors': 'seniors',
      'seniors': 'seniors' // variante
    };
    
    // Trouver la catégorie d'exercice
    const categoryKey = exercise.category.toLowerCase();
    const categorySlug = categoryMapping[categoryKey] || 'autres';
    const exerciseCategory = await prisma.exerciseCategory.findUnique({
      where: { slug: categorySlug }
    });
    if (exerciseCategory) {
      categoryId = exerciseCategory.id;
    }
    
    // Trouver la catégorie d'âge
    const ageCategoryKey = exercise.ageCategory.toLowerCase();
    const ageCategorySlug = ageCategoryMapping[ageCategoryKey] || 'tous';
    const ageCategory = await prisma.ageCategory.findUnique({
      where: { slug: ageCategorySlug }
    });
    if (ageCategory) {
      ageCategoryId = ageCategory.id;
    }
    
    // Mettre à jour l'exercice
    await prisma.exercise.update({
      where: { id: exercise.id },
      data: {
        categoryId,
        ageCategoryId
      }
    });
  }
  
  console.log(`✅ Migrated ${exercises.length} exercises to new category system!`);
}

seedCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });