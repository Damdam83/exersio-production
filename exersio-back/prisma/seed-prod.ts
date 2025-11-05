import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding production database...');

  // Check if sports already exist
  const existingSports = await prisma.sport.count();
  if (existingSports > 0) {
    console.log('✅ Sports already seeded, skipping...');
    return;
  }

  console.log('📦 Inserting sports...');
  // Insert sports (same as migration)
  await prisma.$executeRaw`
    INSERT INTO "Sport" (id, name, slug, icon, "order", "createdAt", "updatedAt") VALUES
      ('sport-volleyball', 'Volley-ball', 'volleyball', '🏐', 1, NOW(), NOW()),
      ('sport-football', 'Football', 'football', '⚽', 2, NOW(), NOW()),
      ('sport-basketball', 'Basketball', 'basketball', '🏀', 3, NOW(), NOW()),
      ('sport-handball', 'Handball', 'handball', '🤾', 4, NOW(), NOW()),
      ('sport-tennis', 'Tennis', 'tennis', '🎾', 5, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  `;

  console.log('📦 Inserting exercise categories...');
  // Exercise categories (abbreviated for brevity)
  await prisma.$executeRaw`
    INSERT INTO "ExerciseCategory" (id, name, slug, "order", "sportId", "createdAt", "updatedAt") VALUES
      ('cat-vb-attack', 'Attaque', 'attack', 1, 'sport-volleyball', NOW(), NOW()),
      ('cat-vb-defense', 'Défense', 'defense', 2, 'sport-volleyball', NOW(), NOW()),
      ('cat-vb-serve', 'Service', 'serve', 3, 'sport-volleyball', NOW(), NOW()),
      ('cat-vb-reception', 'Réception', 'reception', 4, 'sport-volleyball', NOW(), NOW()),
      ('cat-vb-setting', 'Passe', 'setting', 5, 'sport-volleyball', NOW(), NOW()),
      ('cat-vb-tactics', 'Tactique', 'tactics', 6, 'sport-volleyball', NOW(), NOW()),
      ('cat-fb-attack', 'Attaque', 'attack', 1, 'sport-football', NOW(), NOW()),
      ('cat-fb-defense', 'Défense', 'defense', 2, 'sport-football', NOW(), NOW()),
      ('cat-fb-possession', 'Conservation', 'possession', 3, 'sport-football', NOW(), NOW()),
      ('cat-fb-transition', 'Transition', 'transition', 4, 'sport-football', NOW(), NOW()),
      ('cat-fb-finishing', 'Finition', 'finishing', 5, 'sport-football', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  `;

  console.log('📦 Inserting age categories...');
  // Age categories (abbreviated)
  await prisma.$executeRaw`
    INSERT INTO "AgeCategory" (id, name, slug, "minAge", "maxAge", "order", "sportId", "createdAt", "updatedAt") VALUES
      ('age-vb-u11', 'U11 (Poussins)', 'u11', 9, 10, 1, 'sport-volleyball', NOW(), NOW()),
      ('age-vb-u13', 'U13 (Benjamins)', 'u13', 11, 12, 2, 'sport-volleyball', NOW(), NOW()),
      ('age-vb-u15', 'U15 (Minimes)', 'u15', 13, 14, 3, 'sport-volleyball', NOW(), NOW()),
      ('age-vb-u17', 'U17 (Cadets)', 'u17', 15, 16, 4, 'sport-volleyball', NOW(), NOW()),
      ('age-vb-u20', 'U20 (Juniors)', 'u20', 17, 19, 5, 'sport-volleyball', NOW(), NOW()),
      ('age-vb-senior', 'Seniors', 'senior', 20, NULL, 6, 'sport-volleyball', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  `;

  console.log('✅ Production seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
