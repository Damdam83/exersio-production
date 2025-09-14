import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { AuthorizationService } from '../../common/auth/authorization.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SessionsController],
  providers: [SessionsService, AuthorizationService],
})
export class SessionsModule {}
