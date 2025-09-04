import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { CustomLoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const startTime = Date.now();

    // Générer un ID unique pour la requête
    const requestId = this.generateRequestId();
    (request as any).requestId = requestId;

    // Logger la requête entrante
    this.logger.debug(`Incoming request: ${request.method} ${request.url}`, 'HTTP', {
      requestId,
      method: request.method,
      url: request.url,
      ip: this.getClientIP(request),
      userAgent: request.get('User-Agent'),
      userId: (request as any).user?.id,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          
          // Logger la réponse
          this.logger.logRequest({
            requestId,
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            responseTime,
            ip: this.getClientIP(request),
            userAgent: request.get('User-Agent'),
            userId: (request as any).user?.id,
          });

          // Logger les performances si la requête est lente
          if (responseTime > 1000) {
            this.logger.logPerformance(
              `${request.method} ${request.url}`,
              responseTime,
              { requestId, userId: (request as any).user?.id }
            );
          }
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          
          this.logger.error(
            `Request failed: ${request.method} ${request.url}`,
            error.stack,
            'HTTP',
            {
              requestId,
              method: request.method,
              url: request.url,
              statusCode: error.status || 500,
              responseTime,
              ip: this.getClientIP(request),
              userAgent: request.get('User-Agent'),
              userId: (request as any).user?.id,
              errorMessage: error.message,
            }
          );
        },
      })
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getClientIP(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string) ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}