import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getExerciseCategories() {
    return this.prisma.exerciseCategory.findMany({
      orderBy: { order: 'asc' }
    });
  }

  async getAgeCategories() {
    return this.prisma.ageCategory.findMany({
      orderBy: { order: 'asc' }
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