import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('demo1234', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@exersio.app' },
    update: {},
    create: { email: 'demo@exersio.app', name: 'Coach Demo', passwordHash, role: 'coach' }
  });

  const club = await prisma.club.create({
    data: { name: 'Volley Club Demo', description: 'Club de démonstration', ownerId: user.id }
  });

  await prisma.user.update({ where: { id: user.id }, data: { clubId: club.id } });

  for (let i = 1; i <= 3; i++) {
    await prisma.exercise.create({
      data: {
        name: `Exercice ${i}`,
        description: 'Description de base',
        duration: 15,
        category: 'échauffement',
        ageCategory: 'tous',
        sport: 'volleyball',
        instructions: ['Étape 1', 'Étape 2'],
        createdById: user.id,
        clubId: club.id,
        isPublic: true
      }
    });
  }

  const s = await prisma.session.create({
    data: {
      name: 'Séance de test',
      description: 'Séance avec quelques exercices',
      date: new Date(),
      duration: 90,
      objectives: ['Travail du service', 'Réception'],
      createdById: user.id,
      clubId: club.id,
      status: 'planned'
    }
  });
  const exs = await prisma.exercise.findMany({ where: { clubId: club.id }, take: 2 });
  let idx = 0;
  for (const e of exs) {
    await prisma.sessionExercise.create({ data: { sessionId: s.id, exerciseId: e.id, order: idx++ } });
  }

  console.log('Seed completed. Login with demo@exersio.app / demo1234');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
