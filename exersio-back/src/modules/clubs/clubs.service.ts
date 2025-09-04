import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClubsService {
  constructor(private prisma: PrismaService) {}

  async list(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      this.prisma.club.count(),
      this.prisma.club.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
    ]);
    const pagination = { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
    return { success: true, data: items, pagination };
  }

  async create(userId: string, dto: any) {
    const club = await this.prisma.club.create({ data: { ...dto, ownerId: userId } });
    await this.prisma.user.update({ where: { id: userId }, data: { clubId: club.id } });
    return club;
  }

  async get(id: string) {
    const club = await this.prisma.club.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('Club not found');
    return club;
  }

  async update(id: string, dto: any) {
    const club = await this.prisma.club.update({ where: { id }, data: dto });
    return club;
  }

  async delete(id: string) {
    await this.prisma.club.delete({ where: { id } });
    return { deleted: true };
  }
}
