import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthorizationService {
  constructor(private prisma: PrismaService) {}

  async assertAdminOrClubOwner(user: any, clubId: string) {
    if (user.role === 'admin') return;
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club || club.ownerId !== user.id) throw new ForbiddenException('Forbidden');
  }

  async assertAdminOrResourceOwner(user: any, resource: { createdById?: string; clubId?: string | null }) {
    if (user.role === 'admin') return;
    if (resource.createdById && resource.createdById === user.id) return;
    if (resource.clubId) {
      const club = await this.prisma.club.findUnique({ where: { id: resource.clubId } });
      if (club && club.ownerId === user.id) return;
    }
    throw new ForbiddenException('Forbidden');
  }
}
