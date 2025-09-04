import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { genSalt, hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async list(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
    ]);
    const pagination = { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
    const data = items.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar, clubId: u.clubId, createdAt: u.createdAt }));
    return { success: true, data, pagination };
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await hash(dto.password || Math.random().toString(36).slice(2), await genSalt(10));
    const user = await this.prisma.user.create({ data: { name: dto.name, email: dto.email, role: dto.role || 'coach', passwordHash } });
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  }

  async get(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, clubId: user.clubId, createdAt: user.createdAt };
  }

  async update(requestUser: any, id: string, dto: UpdateUserDto) {
    if (requestUser.id !== id && requestUser.role !== 'admin') throw new ForbiddenException('Forbidden');
    const data: any = { ...dto };
    if (dto.password) { data.passwordHash = await hash(dto.password, await genSalt(10)); delete data.password; }
    const user = await this.prisma.user.update({ where: { id }, data });
    return { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, clubId: user.clubId, createdAt: user.createdAt };
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }
}
