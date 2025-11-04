import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { CustomLoggerService } from '../../common/logger/logger.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, 
    private jwt: JwtService,
    private mailService: MailService,
    private logger: CustomLoggerService
  ) {}

  private sign(user: { id: string; email: string; role: string }) {
    return this.jwt.sign({ id: user.id, email: user.email, role: user.role }, { expiresIn: '7d' });
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');
    
    const passwordHash = await hash(dto.password, await genSalt(10));
    const emailVerificationToken = this.generateToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: 'coach',
        emailVerificationToken,
        emailVerificationExpires,
        preferredSportId: dto.preferredSportId
      }
    });

    // Envoyer l'email de confirmation
    await this.mailService.sendConfirmationEmail(user.email, user.name, emailVerificationToken);
    
    // Logger l'inscription
    this.logger.logAuth('User registration', {
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerified: false,
    });
    
    // Ne pas connecter automatiquement l'utilisateur - il doit confirmer son email
    return { 
      message: 'Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.',
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        avatar: user.avatar, 
        createdAt: user.createdAt, 
        clubId: user.clubId,
        emailVerified: user.emailVerified 
      }
    };
  }

  async login(dto: LoginDto) {
    // Test log debug
    this.logger.log('DEBUG: Login method called', 'AuthService');

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        club: true,
        preferredSport: true
      }
    });
    if (!user) {
      this.logger.logAuth('Login attempt - user not found', {
        email: dto.email,
      }, false);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const ok = await compare(dto.password, user.passwordHash);
    if (!ok) {
      this.logger.logAuth('Login attempt - invalid password', {
        userId: user.id,
        email: user.email,
      }, false);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Vérifier si l'email est confirmé
    if (!user.emailVerified) {
      this.logger.logAuth('Login attempt - email not verified', {
        userId: user.id,
        email: user.email,
      }, false);
      throw new UnauthorizedException('Email not verified. Please check your email and confirm your account.');
    }
    
    const token = this.sign(user);
    
    // Logger la connexion réussie
    this.logger.logAuth('User login successful', {
      userId: user.id,
      email: user.email,
      role: user.role,
      clubId: user.clubId,
    });
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        clubId: user.clubId,
        emailVerified: user.emailVerified,
        preferredSportId: user.preferredSportId,
        preferredSport: user.preferredSport ? {
          id: user.preferredSport.id,
          name: user.preferredSport.name,
          slug: user.preferredSport.slug,
          icon: user.preferredSport.icon,
          order: user.preferredSport.order
        } : undefined
      },
      token,
      club: user.club ? {
        id: user.club.id,
        name: user.club.name,
        description: user.club.description,
        logo: user.club.logo,
        ownerId: user.club.ownerId,
        createdAt: user.club.createdAt
      } : undefined,
    };
  }

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        club: true,
        preferredSport: true
      }
    });
    if (!user) throw new UnauthorizedException('Invalid user');
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        clubId: user.clubId,
        preferredSportId: user.preferredSportId,
        preferredSport: user.preferredSport ? {
          id: user.preferredSport.id,
          name: user.preferredSport.name,
          slug: user.preferredSport.slug,
          icon: user.preferredSport.icon,
          order: user.preferredSport.order
        } : undefined
      },
      club: user.club ? { id: user.club.id, name: user.club.name, description: user.club.description, logo: user.club.logo, ownerId: user.club.ownerId, createdAt: user.club.createdAt } : undefined,
    };
  }

  refresh(user: any) { return { token: this.sign(user) }; }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  async confirmEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Confirmer l'email et nettoyer les tokens
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    // Logger la confirmation d'email
    this.logger.logAuth('Email confirmation successful', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Récupérer l'utilisateur avec les relations
    const userWithRelations = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        preferredSport: true,
        club: true
      }
    });

    if (!userWithRelations) {
      throw new NotFoundException('Utilisateur non trouvé après confirmation');
    }

    // Connecter automatiquement l'utilisateur après confirmation
    const jwtToken = this.sign(user);

    return {
      message: 'Email confirmé avec succès !',
      user: {
        id: userWithRelations.id,
        name: userWithRelations.name,
        email: userWithRelations.email,
        role: userWithRelations.role,
        avatar: userWithRelations.avatar,
        createdAt: userWithRelations.createdAt,
        clubId: userWithRelations.clubId,
        emailVerified: true,
        preferredSportId: userWithRelations.preferredSportId,
        preferredSport: userWithRelations.preferredSport ? {
          id: userWithRelations.preferredSport.id,
          name: userWithRelations.preferredSport.name,
          slug: userWithRelations.preferredSport.slug,
          icon: userWithRelations.preferredSport.icon,
          order: userWithRelations.preferredSport.order
        } : undefined
      },
      token: jwtToken,
    };
  }

  async resendConfirmationEmail(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Générer nouveau token
    const emailVerificationToken = this.generateToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    // Renvoyer l'email
    await this.mailService.sendConfirmationEmail(user.email, user.name, emailVerificationToken);
    
    // Logger le renvoi d'email
    this.logger.logAuth('Confirmation email resent', {
      userId: user.id,
      email: user.email,
    });

    return {
      message: 'Email de confirmation renvoyé',
    };
  }

  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return {
        message: 'Si cette adresse email existe, vous recevrez un lien de réinitialisation',
      };
    }

    // Générer token de réinitialisation
    const passwordResetToken = this.generateToken();
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    // Envoyer email de réinitialisation
    await this.mailService.sendPasswordResetEmail(user.email, user.name, passwordResetToken);
    
    // Logger la demande de réinitialisation
    this.logger.logAuth('Password reset requested', {
      userId: user.id,
      email: user.email,
    });

    return {
      message: 'Si cette adresse email existe, vous recevrez un lien de réinitialisation',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hasher le nouveau mot de passe
    const passwordHash = await hash(newPassword, await genSalt(10));

    // Mettre à jour le mot de passe et nettoyer les tokens
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    
    // Logger la réinitialisation de mot de passe
    this.logger.logAuth('Password reset successful', {
      userId: user.id,
      email: user.email,
    });

    return {
      message: 'Mot de passe réinitialisé avec succès',
    };
  }

  /**
   * DEV ONLY - Activer un email sans token (pour les tests)
   */
  async devActivateEmail(email: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('This method is only available in development');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      return { message: 'Email already verified' };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    this.logger.logAuth('DEV: Email activated manually', {
      userId: user.id,
      email: user.email,
    });

    return { message: 'Email activated successfully' };
  }
}
