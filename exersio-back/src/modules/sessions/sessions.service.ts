import { Injectable, NotFoundException } from '@nestjs/common';
import { $Enums, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

function normalizeStatus(status?: string): $Enums.SessionStatus | undefined {
  if (!status) return undefined;
  const v = status.replace('-', '_') as $Enums.SessionStatus;
  // sécurise la valeur
  const allowed = ['planned', 'completed', 'cancelled', 'in_progress'] as const;
  return (allowed as readonly string[]).includes(v) ? v : undefined;
}

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async list(query: any, page = 1, limit = 10, user?: any) {
    const where: any = {};
    if (query.status) where.status = normalizeStatus(String(query.status));
    if (query.clubId) where.clubId = String(query.clubId);
    if (query.createdById) where.createdById = String(query.createdById);

    // Filtrer par utilisateur : ses propres sessions OU celles de son club
    if (user) {
      where.OR = [
        { createdById: user.id }, // Sessions créées par l'utilisateur
        ...(user.clubId ? [{ clubId: user.clubId }] : []) // Sessions du club si l'utilisateur fait partie d'un club
      ];
    }

    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      this.prisma.session.count({ where }),
      this.prisma.session.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          exercises: { include: { exercise: true }, orderBy: { order: 'asc' } },
        },
      }),
    ]);
    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
    const mapped = items.map((s) => ({
      ...s,
      exercises: s.exercises.map((se) => se.exerciseId),
    }));
    return { success: true, data: mapped, pagination };
  }

  async create(userId: string, data: any) {
    const exercises = Array.isArray(data.exercises) ? data.exercises : [];
    const session = await this.prisma.session.create({
      data: {
        name: data.name,
        description: data.description,
        date: new Date(data.date),
        duration: data.duration,
        objectives: data.objectives,
        createdById: userId,
        clubId: data.clubId,
        sport: data.sport,
        ageCategory: data.ageCategory,
        level: data.level,
        status: normalizeStatus(data.status) || 'planned',
        notes: data.notes,
      },
    });
    if (exercises.length) {
      const createMany: Prisma.SessionExerciseCreateManyInput[] = exercises.map(
        (e: any, idx: number) => ({
          sessionId: session.id,
          exerciseId: typeof e === 'string' ? e : e.exerciseId,
          order:
            typeof e === 'object' && typeof e.order === 'number'
              ? e.order
              : idx,
        })
      );
      await this.prisma.sessionExercise.createMany({ data: createMany });
    }
    const withEx = await this.prisma.session.findUnique({
      where: { id: session.id },
      include: { exercises: true },
    });
    return {
      ...session,
      exercises: withEx?.exercises.map((se) => se.exerciseId) || [],
    };
  }

  async get(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { exercises: { orderBy: { order: 'asc' } } },
    });
    if (!session) throw new NotFoundException('Session not found');
    return {
      ...session,
      exercises: session.exercises.map((se) => se.exerciseId),
    };
  }

  async update(id: string, data: any) {
    const upd: any = { ...data };
    if (upd.date) upd.date = new Date(upd.date);
    if (upd.status) upd.status = normalizeStatus(upd.status);
    const session = await this.prisma.session.update({
      where: { id },
      data: upd,
    });
    if (Array.isArray(data.exercises)) {
      await this.prisma.sessionExercise.deleteMany({
        where: { sessionId: id },
      });
      const createMany: Prisma.SessionExerciseCreateManyInput[] =
        data.exercises.map((e: any, idx: number) => ({
          sessionId: id,
          exerciseId: typeof e === 'string' ? e : e.exerciseId,
          order:
            typeof e === 'object' && typeof e.order === 'number'
              ? e.order
              : idx,
        }));
      if (createMany.length)
        await this.prisma.sessionExercise.createMany({ data: createMany });
    }
    const withEx = await this.prisma.session.findUnique({
      where: { id },
      include: { exercises: { orderBy: { order: 'asc' } } },
    });
    return {
      ...session,
      exercises: withEx?.exercises.map((se) => se.exerciseId) || [],
    };
  }

  async delete(id: string) {
    await this.prisma.session.delete({ where: { id } });
    return { deleted: true };
  }

  async duplicate(id: string, userId: string) {
    const src = await this.prisma.session.findUnique({ where: { id } });
    if (!src) throw new NotFoundException('Session not found');
    const dupe = await this.prisma.session.create({
      data: {
        name: src.name + ' (copie)',
        description: src.description || undefined,
        date: src.date,
        duration: src.duration,
        objectives: src.objectives || undefined,
        createdById: userId,
        clubId: src.clubId || undefined,
        sport: src.sport || undefined,
        ageCategory: src.ageCategory || undefined,
        level: src.level || undefined,
        status: src.status,
        notes: src.notes || undefined,
      },
    });
    const sesEx = await this.prisma.sessionExercise.findMany({
      where: { sessionId: src.id },
      orderBy: { order: 'asc' },
    });
    if (sesEx.length)
      await this.prisma.sessionExercise.createMany({
        data: sesEx.map((se) => ({
          sessionId: dupe.id,
          exerciseId: se.exerciseId,
          order: se.order,
        })),
      });
    return { ...dupe, exercises: sesEx.map((se) => se.exerciseId) };
  }
}
