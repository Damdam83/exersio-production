import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  async list(query: any, page = 1, limit = 10) {
    const where: any = {};
    if (query.clubId) where.clubId = String(query.clubId);
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      this.prisma.invitation.count({ where }),
      this.prisma.invitation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { club: true, invitedBy: true },
      }),
    ]);
    const data = items.map((i) => ({
      id: i.id,
      clubId: i.clubId,
      clubName: i.club.name,
      invitedBy: i.invitedById,
      invitedByName: i.invitedBy.name,
      email: i.email,
      role: i.role,
      status: i.status,
      createdAt: i.createdAt,
      expiresAt: i.expiresAt,
    }));
    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
    return { success: true, data, pagination };
  }

  async create(userId: string, data: any) {
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    return this.prisma.invitation.create({
      data: { ...data, invitedById: userId, expiresAt },
    });
  }

  async updateStatus(id: string, status: 'pending' | 'accepted' | 'declined') {
    return this.prisma.invitation.update({ where: { id }, data: { status } });
  }
}
