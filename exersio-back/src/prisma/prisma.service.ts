import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CustomLoggerService } from '../common/logger/logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private customLogger: CustomLoggerService) {
    super({
      log: ['error', 'warn', 'info'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.customLogger.logPrismaEvent('Database connection established', {});
      
      // Log des événements Prisma
      this.$on('error' as never, (e: any) => {
        this.customLogger.logPrismaEvent('Database error occurred', {
          error: e.message || String(e),
        }, false);
      });
      
      this.$on('warn' as never, (e: any) => {
        this.customLogger.logPrismaEvent('Database warning', {
          message: e.message || String(e),
        }, false);
      });
      
      this.$on('info' as never, (e: any) => {
        this.customLogger.logPrismaEvent('Database info', {
          message: e.message || String(e),
        });
      });
      
    } catch (error) {
      this.customLogger.logPrismaEvent('Database connection failed', {
        error: error instanceof Error ? error.message : String(error),
      }, false);
      throw error;
    }
  }
  
  async enableShutdownHooks(app: INestApplication) {
    (this as any).$on?.('beforeExit', async () => {
      this.customLogger.logPrismaEvent('Database disconnecting', {});
      await app.close();
    });
  }
}
