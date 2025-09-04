import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  [key: string]: any;
}

@Injectable()
export class CustomLoggerService implements LoggerService {
  private readonly winston: winston.Logger;
  private readonly isDevelopment: boolean;

  constructor(private configService: ConfigService) {
    this.isDevelopment = this.configService.get('NODE_ENV') !== 'production';
    this.winston = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const logLevel = this.configService.get('LOG_LEVEL', 'info');
    const logDir = this.configService.get('LOG_DIR', 'logs');

    const formats = [
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ];

    if (this.isDevelopment) {
      formats.push(
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
          const contextStr = context ? `[${context}] ` : '';
          const metaStr = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
          const traceStr = trace ? `\n${trace}` : '';
          return `${timestamp} ${level}: ${contextStr}${message}${metaStr}${traceStr}`;
        })
      );
    }

    const transports: winston.transport[] = [
      // Console transport pour le développement
      new winston.transports.Console({
        level: this.isDevelopment ? 'debug' : 'info',
        format: winston.format.combine(...formats),
      }),
    ];

    // File transports pour la production (et test en développement)
    if (!this.isDevelopment || true) { // Force logging en dev pour test
      transports.push(
        // Logs d'erreur avec rotation quotidienne
        new DailyRotateFile({
          filename: `${logDir}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        // Tous les logs avec rotation quotidienne
        new DailyRotateFile({
          filename: `${logDir}/combined-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        // Logs d'authentification
        new DailyRotateFile({
          filename: `${logDir}/auth-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          maxSize: '10m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            winston.format((info) => {
              return info.category === 'auth' ? info : false;
            })()
          ),
        }),
        // Logs d'emails
        new DailyRotateFile({
          filename: `${logDir}/email-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          maxSize: '10m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            winston.format((info) => {
              return info.category === 'email' ? info : false;
            })()
          ),
        })
      );
    }

    return winston.createLogger({
      level: logLevel,
      transports,
      // Ne pas quitter sur les erreurs non gérées
      exitOnError: false,
    });
  }

  /**
   * Log général avec contexte
   */
  log(message: any, context?: string, extra?: LogContext) {
    this.winston.info(message, { context, ...extra });
  }

  /**
   * Log d'erreur avec stack trace
   */
  error(message: any, trace?: string, context?: string, extra?: LogContext) {
    this.winston.error(message, { context, trace, ...extra });
  }

  /**
   * Log d'avertissement
   */
  warn(message: any, context?: string, extra?: LogContext) {
    this.winston.warn(message, { context, ...extra });
  }

  /**
   * Log de debug
   */
  debug(message: any, context?: string, extra?: LogContext) {
    this.winston.debug(message, { context, ...extra });
  }

  /**
   * Log détaillé
   */
  verbose(message: any, context?: string, extra?: LogContext) {
    this.winston.verbose(message, { context, ...extra });
  }

  /**
   * Log spécialisé pour l'authentification
   */
  logAuth(event: string, context: LogContext, success: boolean = true) {
    this.winston.info(`AUTH: ${event}`, {
      category: 'auth',
      success,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  /**
   * Log spécialisé pour les emails
   */
  logEmail(event: string, context: LogContext & { to?: string; subject?: string; provider?: string }, success: boolean = true) {
    this.winston.info(`EMAIL: ${event}`, {
      category: 'email',
      success,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  /**
   * Log spécialisé pour les requêtes HTTP
   */
  logRequest(context: LogContext & { method: string; url: string; statusCode: number; responseTime: number }) {
    const level = context.statusCode >= 400 ? 'warn' : 'info';
    this.winston.log(level, `${context.method} ${context.url} ${context.statusCode} ${context.responseTime}ms`, {
      category: 'http',
      ...context,
    });
  }

  /**
   * Log spécialisé pour les opérations de base de données
   */
  logDatabase(operation: string, table: string, context: LogContext, duration?: number) {
    this.winston.info(`DB: ${operation} on ${table}`, {
      category: 'database',
      operation,
      table,
      duration,
      ...context,
    });
  }

  /**
   * Log spécialisé pour les événements Prisma
   */
  logPrismaEvent(event: string, context: LogContext, success: boolean = true) {
    this.winston.info(`PRISMA: ${event}`, {
      category: 'database',
      subcategory: 'prisma',
      success,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  /**
   * Log de performance
   */
  logPerformance(operation: string, duration: number, context?: LogContext) {
    const level = duration > 1000 ? 'warn' : 'info';
    this.winston.log(level, `PERF: ${operation} took ${duration}ms`, {
      category: 'performance',
      operation,
      duration,
      ...context,
    });
  }
}