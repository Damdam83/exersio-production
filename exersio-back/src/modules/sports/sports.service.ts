import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Sport } from '@prisma/client';

@Injectable()
export class SportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère la liste de tous les sports disponibles
   * Triés par ordre croissant
   */
  async getSports(): Promise<Sport[]> {
    return this.prisma.sport.findMany({
      orderBy: { order: 'asc' }
    });
  }

  /**
   * Récupère un sport par son slug
   */
  async getSportBySlug(slug: string): Promise<Sport | null> {
    return this.prisma.sport.findUnique({
      where: { slug }
    });
  }

  /**
   * Récupère un sport par son ID
   */
  async getSportById(id: string): Promise<Sport | null> {
    return this.prisma.sport.findUnique({
      where: { id }
    });
  }
}
