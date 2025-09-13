/**
 * Service d'envoi d'emails pour Exersio
 * Utilise NodeMailer pour l'envoi d'emails
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from '../../common/logger/logger.service';
import * as nodemailer from 'nodemailer';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(
    private configService: ConfigService,
    private customLogger: CustomLoggerService
  ) {
    this.createTransporter();
  }

  private createTransporter() {
    // Configuration SMTP
    const smtpHost = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASS');

    // En développement, utiliser Ethereal Email pour tester
    if (!smtpUser || !smtpPassword) {
      this.logger.warn('SMTP credentials not provided, using test configuration');
      this.setupTestTransporter();
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });

      this.logger.log(`Email transporter configured with ${smtpHost}:${smtpPort}`);
    } catch (error) {
      this.logger.error('Failed to configure email transporter', error);
      this.setupTestTransporter();
    }
  }

  private async setupTestTransporter() {
    try {
      // Créer un compte de test Ethereal Email
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.logger.log('Test email transporter configured (Ethereal Email)');
    } catch (error) {
      this.logger.error('Failed to setup test transporter', error);
    }
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.error('Email transporter not configured');
        return false;
      }

      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM', '"Exersio" <noreply@exersio.app>'),
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text || this.extractTextFromHtml(emailData.html),
        html: emailData.html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent to ${emailData.to}: ${info.messageId}`);
      
      // Log spécialisé pour les emails
      this.customLogger.logEmail('Email sent successfully', {
        to: emailData.to,
        subject: emailData.subject,
        messageId: info.messageId,
        provider: info.preview ? 'Ethereal Test' : 'Production SMTP',
      }, true);

      // En mode test, afficher le lien de prévisualisation
      if (info.preview) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        this.logger.log(`Preview URL: ${previewUrl}`);
        this.customLogger.logEmail('Test email preview available', {
          to: emailData.to,
          previewUrl,
        });
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${emailData.to}`, error);
      
      // Log spécialisé pour les erreurs d'email
      this.customLogger.logEmail('Email sending failed', {
        to: emailData.to,
        subject: emailData.subject,
        errorMessage: error instanceof Error ? error.message : String(error),
        provider: 'Unknown',
      }, false);
      
      return false;
    }
  }

  async sendConfirmationEmail(email: string, name: string, token: string): Promise<boolean> {
    const confirmationUrl = this.getConfirmationUrl(token);
    
    const html = this.generateConfirmationEmailHtml(name, confirmationUrl);
    
    return this.sendEmail({
      to: email,
      subject: '🎯 Confirmez votre compte Exersio',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
    const resetUrl = this.getPasswordResetUrl(token);
    
    const html = this.generatePasswordResetEmailHtml(name, resetUrl);
    
    return this.sendEmail({
      to: email,
      subject: '🔐 Réinitialisation de votre mot de passe Exersio',
      html,
    });
  }

  private getConfirmationUrl(token: string): string {
    const baseUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    return `${baseUrl}/?token=${token}`;
  }

  private getPasswordResetUrl(token: string): string {
    const baseUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    return `${baseUrl}/?token=${token}&action=reset-password`;
  }

  private generateConfirmationEmailHtml(name: string, confirmationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmez votre compte Exersio</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px 10px 0 0;
            color: white;
          }
          .content {
            padding: 40px 30px;
            background: #ffffff;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🎯 Exersio</div>
          <p>Plateforme d'entraînement sportif</p>
        </div>
        
        <div class="content">
          <h2>Bonjour ${name} ! 👋</h2>
          
          <p>Bienvenue sur <strong>Exersio</strong> ! Nous sommes ravis de vous compter parmi nous.</p>
          
          <p>Pour activer votre compte et commencer à créer des exercices et des séances d'entraînement, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
          
          <div style="text-align: center;">
            <a href="${confirmationUrl}" class="button">
              ✅ Confirmer mon compte
            </a>
          </div>
          
          <div class="warning">
            <strong>⏰ Important :</strong> Ce lien est valable pendant 24 heures seulement.
          </div>
          
          <p>Une fois votre compte confirmé, vous pourrez :</p>
          <ul>
            <li>📝 Créer des exercices personnalisés</li>
            <li>🏃‍♂️ Organiser des séances d'entraînement</li>
            <li>👥 Gérer votre équipe et vos joueurs</li>
            <li>📊 Suivre les performances</li>
            <li>📱 Utiliser l'app mobile hors ligne</li>
          </ul>
          
          <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #667eea;"><a href="${confirmationUrl}">${confirmationUrl}</a></p>
        </div>
        
        <div class="footer">
          <p>Si vous n'avez pas créé de compte sur Exersio, vous pouvez ignorer cet email.</p>
          <p>© 2025 Exersio - Plateforme d'entraînement sportif</p>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetEmailHtml(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation mot de passe Exersio</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            border-radius: 10px 10px 0 0;
            color: white;
          }
          .content {
            padding: 40px 30px;
            background: #ffffff;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .warning {
            background: #ffe6e6;
            border: 1px solid #ff9999;
            color: #cc0000;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🔐 Exersio</div>
          <p>Réinitialisation mot de passe</p>
        </div>
        
        <div class="content">
          <h2>Bonjour ${name},</h2>
          
          <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte Exersio.</p>
          
          <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">
              🔐 Réinitialiser mon mot de passe
            </a>
          </div>
          
          <div class="warning">
            <strong>⏰ Important :</strong> Ce lien est valable pendant 1 heure seulement pour des raisons de sécurité.
          </div>
          
          <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #ff6b6b;"><a href="${resetUrl}">${resetUrl}</a></p>
        </div>
        
        <div class="footer">
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
          <p>© 2025 Exersio - Plateforme d'entraînement sportif</p>
        </div>
      </body>
      </html>
    `;
  }

  private extractTextFromHtml(html: string): string {
    // Extraction basique du texte depuis HTML
    return html
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}