import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Controller('setup')
export class SetupController {
  constructor(private prisma: PrismaService) {}

  @Post('admin')
  async createAdmin(@Body() body: { password?: string }) {
    // Vérifier qu'aucun admin n'existe
    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (existingAdmin) {
      return { success: false, message: 'Admin already exists' };
    }

    // Créer l'admin
    const password = body.password || 'admin123';
    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await this.prisma.user.create({
      data: {
        email: 'admin@exersio.com',
        name: 'Admin Exersio',
        passwordHash,
        role: 'admin',
        emailVerified: true,
      }
    });

    return {
      success: true,
      message: 'Admin created successfully',
      credentials: {
        email: admin.email,
        password: password
      }
    };
  }
}