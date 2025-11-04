import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomLoggerService } from '../../common/logger/logger.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly logger: CustomLoggerService,
  ) {}

  async onModuleInit() {
    await this.createAdminIfNotExists();
  }

  private async createAdminIfNotExists() {
    try {
      const adminEmail = this.config.get<string>('ADMIN_EMAIL');
      const adminPassword = this.config.get<string>('ADMIN_PASSWORD');
      const adminName = this.config.get<string>('ADMIN_NAME');

      if (!adminEmail || !adminPassword || !adminName) {
        this.logger.warn(
          'Admin credentials not found in environment variables. Skipping admin account creation.',
          'AdminSeedService',
        );
        return;
      }

      // Vérifier si un compte admin existe déjà
      const existingAdmin = await this.prisma.user.findUnique({
        where: { email: adminEmail },
      });

      if (existingAdmin) {
        this.logger.log(
          `Admin account already exists with email: ${adminEmail}`,
          'AdminSeedService',
        );
        return;
      }

      // Créer le compte admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const adminUser = await this.prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: hashedPassword,
          name: adminName,
          role: 'admin',
          emailVerified: true, // Admin account is pre-verified
        },
      });

      this.logger.log(
        `✅ Admin account created successfully: ${adminUser.email} (ID: ${adminUser.id})`,
        'AdminSeedService',
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to create admin account: ${error?.message || error}`,
        error?.stack,
        'AdminSeedService',
      );
    }
  }
}
