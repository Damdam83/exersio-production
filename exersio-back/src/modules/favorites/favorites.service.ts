import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getFavorites(userId: string) {
    const favorites = await this.prisma.userExerciseFavorite.findMany({
      where: { userId },
      include: {
        exercise: true
      }
    });
    
    return favorites;
  }

  async addFavorite(userId: string, exerciseId: string) {
    return this.prisma.userExerciseFavorite.create({
      data: {
        userId,
        exerciseId
      }
    });
  }

  async removeFavorite(userId: string, exerciseId: string) {
    return this.prisma.userExerciseFavorite.deleteMany({
      where: {
        userId,
        exerciseId
      }
    });
  }

  async isFavorite(userId: string, exerciseId: string): Promise<boolean> {
    const favorite = await this.prisma.userExerciseFavorite.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId
        }
      }
    });
    
    return !!favorite;
  }
}