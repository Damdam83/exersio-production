import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ExercisesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async list(query: any, page = 1, limit = 10, userId?: string) {
    const where: any = {};
    
    // Filtrage par nouvelle catégorie d'exercice (par ID)
    if (query.categoryId) {
      where.categoryId = String(query.categoryId);
    }
    // Filtrage par nouvelle catégorie d'âge (par ID)  
    if (query.ageCategoryId) {
      where.ageCategoryId = String(query.ageCategoryId);
    }
    
    // Support des anciens filtres pour rétrocompatibilité
    if (query.category && !query.categoryId) {
      where.category = String(query.category);
    }
    if (query.ageCategory && !query.ageCategoryId) {
      where.ageCategory = String(query.ageCategory);
    }
    
    // Filtrage par catégories multiples
    if (query.categoryIds && Array.isArray(query.categoryIds)) {
      where.categoryId = { in: query.categoryIds };
    }
    if (query.ageCategoryIds && Array.isArray(query.ageCategoryIds)) {
      where.ageCategoryId = { in: query.ageCategoryIds };
    }
    
    if (query.clubId) where.clubId = String(query.clubId);
    if (query.createdById) where.createdById = String(query.createdById);
    
    // Filtrer par scope (personal, club, all)
    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      
      // Scope par défaut si non spécifié : 'personal' pour les nouveaux utilisateurs
      const scope = query.scope || 'personal';
      
      if (scope === 'personal') {
        where.createdById = userId;
        where.clubId = null; // Exercices personnels uniquement
      } else if (scope === 'club' && user?.clubId) {
        where.clubId = user.clubId;
      } else if (scope === 'all' && user?.clubId) {
        where.OR = [
          { createdById: userId }, // Ses exercices personnels
          { clubId: user.clubId }   // Exercices du club
        ];
      } else if (scope === 'all' && !user?.clubId) {
        // Utilisateur sans club demandant 'all' : seulement ses exercices
        where.createdById = userId;
      }
    }
    
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      this.prisma.exercise.count({ where }),
      this.prisma.exercise.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        include: {
          categoryRef: true,      // Inclure la catégorie d'exercice
          ageCategoryRef: true,   // Inclure la catégorie d'âge
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          club: {
            select: { id: true, name: true }
          }
        }
      }),
    ]);
    const pagination = { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
    return { success: true, data: items, pagination };
  }

  async create(userId: string, data: any) { 
    const exercise = await this.prisma.exercise.create({ 
      data: { ...data, createdById: userId },
      include: {
        createdBy: true,
        club: {
          include: {
            users: true
          }
        }
      }
    });

    // Déclencher les notifications si l'exercice est ajouté à un club
    if (exercise.clubId) {
      try {
        await this.notificationsService.createExerciseAddedNotification(exercise.id, exercise.clubId);
      } catch (error) {
        // Log l'erreur mais ne pas empêcher la création de l'exercice
        console.error('Error creating exercise notification:', error);
      }
    }

    return exercise;
  }

  async get(id: string) {
    const ex = await this.prisma.exercise.findUnique({ 
      where: { id },
      include: {
        categoryRef: true,
        ageCategoryRef: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        club: {
          select: { id: true, name: true }
        }
      }
    });
    if (!ex) throw new NotFoundException('Exercise not found');
    return ex;
  }

  async update(id: string, data: any) { return this.prisma.exercise.update({ where: { id }, data }); }

  async delete(id: string) { await this.prisma.exercise.delete({ where: { id } }); return { deleted: true }; }

  // Partager un exercice avec le club
  async shareWithClub(id: string, userId: string) {
    const exercise = await this.get(id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    // Vérifier que l'utilisateur est le créateur de l'exercice
    if (exercise.createdById !== userId) {
      throw new Error('Seul le créateur peut partager cet exercice');
    }
    
    // Vérifier que l'utilisateur a un club
    if (!user?.clubId) {
      throw new Error('Vous devez appartenir à un club pour partager un exercice');
    }
    
    // Mettre à jour l'exercice avec le clubId
    return this.prisma.exercise.update({
      where: { id },
      data: { clubId: user.clubId }
    });
  }


  // Vérifier les permissions d'édition
  async canEdit(id: string, userId: string): Promise<boolean> {
    const exercise = await this.get(id);
    return exercise.createdById === userId;
  }

  // Vérifier les permissions de suppression
  async canDelete(id: string, userId: string): Promise<boolean> {
    const exercise = await this.get(id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    // Peut supprimer si:
    // 1. Il est le créateur
    // 2. OU l'exercice est dans son club ET il est le propriétaire du club
    if (exercise.createdById === userId) {
      return true;
    }
    
    if (exercise.clubId && user?.clubId === exercise.clubId) {
      const club = await this.prisma.club.findUnique({ where: { id: exercise.clubId } });
      return club?.ownerId === userId;
    }
    
    return false;
  }
}
