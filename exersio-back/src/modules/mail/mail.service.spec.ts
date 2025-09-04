/**
 * Tests unitaires pour MailService
 * Service critique : envoi emails, templates, sécurité
 */

import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { CustomLoggerService } from '../../common/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('MailService', () => {
  let service: MailService;
  let loggerService: CustomLoggerService;
  let configService: ConfigService;
  let mockTransporter: any;

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({
        messageId: 'mock-message-id',
        response: 'Email sent successfully',
      }),
    };

    mockedNodemailer.createTransport = jest.fn().mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CustomLoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config: Record<string, any> = {
                NODE_ENV: 'test',
                MAIL_HOST: 'smtp.ethereal.email',
                MAIL_PORT: 587,
                MAIL_USER: 'test@ethereal.email',
                MAIL_PASS: 'testpass',
                MAIL_FROM: 'noreply@exersio.app',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    loggerService = module.get<CustomLoggerService>(CustomLoggerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('sendConfirmationEmail', () => {
    it('should send confirmation email with correct template', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const token = 'confirmation-token';

      await service.sendConfirmationEmail(email, name, token);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@exersio.app',
        to: email,
        subject: 'Confirmez votre compte Exersio',
        html: expect.stringContaining('Bienvenue sur Exersio'),
      });

      expect(loggerService.log).toHaveBeenCalledWith(
        expect.stringContaining(`confirmation email sent to ${email}`),
        'MailService'
      );
    });

    it('should handle email sending errors gracefully', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const token = 'confirmation-token';

      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(service.sendConfirmationEmail(email, name, token)).rejects.toThrow('SMTP Error');

      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send confirmation email'),
        'MailService'
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with correct template', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const token = 'reset-token';

      await service.sendPasswordResetEmail(email, name, token);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@exersio.app',
        to: email,
        subject: 'Réinitialiser votre mot de passe Exersio',
        html: expect.stringContaining('Réinitialisation de mot de passe'),
      });

      expect(loggerService.log).toHaveBeenCalledWith(
        expect.stringContaining(`password reset email sent to ${email}`),
        'MailService'
      );
    });

    it('should include correct reset link in email', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const token = 'reset-token';

      await service.sendPasswordResetEmail(email, name, token);

      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(emailCall.html).toContain(`token=${token}`);
      expect(emailCall.html).toContain('action=reset-password');
    });
  });

  describe('template generation', () => {
    it('should generate HTML template with user data', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const token = 'test-token';

      await service.sendConfirmationEmail(email, name, token);

      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(emailCall.html).toContain(name);
      expect(emailCall.html).toContain('Exersio');
      expect(emailCall.html).toContain('style='); // Should have CSS styling
    });
  });

  describe('configuration', () => {
    it('should be properly configured with environment variables', () => {
      expect(configService.get).toHaveBeenCalledWith('MAIL_HOST');
      expect(configService.get).toHaveBeenCalledWith('MAIL_FROM');
    });
  });
});