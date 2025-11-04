/**
 * Tests unitaires pour AuthService
 * Service critique : authentification, confirmation email, sécurité
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { CustomLoggerService } from '../../common/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let mailService: MailService;

  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashedPassword',
    role: 'coach' as const,
    avatar: null,
    clubId: null,
    createdAt: new Date(),
    emailVerified: false,
    emailVerificationToken: null,
    emailVerificationExpires: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    preferredSportId: null,
    club: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
            sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: CustomLoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config: Record<string, any> = {
                JWT_SECRET: 'test-secret',
                JWT_EXPIRES_IN: '24h',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('Email already in use');
    });

    it('should create new user when email does not exist', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result.message).toContain('Compte créé avec succès');
      expect(result.user.email).toBe(registerDto.email);
      expect(mailService.sendConfirmationEmail).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for unverified email', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        ...mockUser,
        emailVerified: false,
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('confirmEmail', () => {
    it('should throw BadRequestException for empty token', async () => {
      await expect(service.confirmEmail('')).rejects.toThrow(BadRequestException);
      await expect(service.confirmEmail('')).rejects.toThrow('Token is required');
    });

    it('should throw BadRequestException for invalid token', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      await expect(service.confirmEmail('invalid-token')).rejects.toThrow(BadRequestException);
      await expect(service.confirmEmail('invalid-token')).rejects.toThrow('Invalid or expired verification token');
    });

    it('should confirm email with valid token', async () => {
      const token = 'valid-token';
      const userWithToken = {
        ...mockUser,
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
      };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userWithToken);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...userWithToken,
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      });

      const result = await service.confirmEmail(token);

      expect(result.message).toContain('Email confirmé avec succès');
      expect(result.user).toBeDefined();
    });
  });

  describe('forgotPassword', () => {
    it('should throw BadRequestException for empty email', async () => {
      await expect(service.forgotPassword('')).rejects.toThrow(BadRequestException);
      await expect(service.forgotPassword('')).rejects.toThrow('Email is required');
    });

    it('should return success message even for non-existent email (security)', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result.message).toContain('Si cette adresse email existe');
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should send reset email for existing user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);

      const result = await service.forgotPassword('test@example.com');

      expect(result.message).toContain('Si cette adresse email existe');
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException for missing parameters', async () => {
      await expect(service.resetPassword('', 'newpass')).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword('token', '')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid token', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      await expect(service.resetPassword('invalid-token', 'newpass')).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword('invalid-token', 'newpass')).rejects.toThrow('Invalid or expired reset token');
    });

    it('should reset password with valid token', async () => {
      const token = 'valid-reset-token';
      const userWithResetToken = {
        ...mockUser,
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
      };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(userWithResetToken);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...userWithResetToken,
        passwordHash: 'newHashedPassword',
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      const result = await service.resetPassword(token, 'newpassword123');

      expect(result.message).toContain('Mot de passe réinitialisé avec succès');
    });
  });
});