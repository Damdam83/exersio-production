import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getExerciseCategories(sportId?: string) {
    const where = sportId ? { sportId } : {};
    return this.prisma.exerciseCategory.findMany({
      where,
      orderBy: { order: 'asc' },
      include: { sport: true }
    });
  }

  async getAgeCategories(sportId?: string) {
    const where = sportId ? { sportId } : {};
    return this.prisma.ageCategory.findMany({
      where,
      orderBy: { order: 'asc' },
      include: { sport: true }
    });
  }

  async getLevels() {
    // Pour l'instant, retournons des niveaux hardcodés
    // TODO: À terme, créer une table Level en base de données
    return [
      { id: '1', name: 'Débutant', description: 'Niveau débutant', order: 1 },
      { id: '2', name: 'Intermédiaire', description: 'Niveau intermédiaire', order: 2 },
      { id: '3', name: 'Confirmé', description: 'Niveau confirmé', order: 3 },
      { id: '4', name: 'Expert', description: 'Niveau expert', order: 4 }
    ];
  }
}