import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { AuthorizationService } from '../../common/auth/authorization.service';

@Module({
  controllers: [ClubsController],
  providers: [ClubsService, AuthorizationService],
})
export class ClubsModule {}
