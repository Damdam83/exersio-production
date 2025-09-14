import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { AuthorizationService } from '../../common/auth/authorization.service';
// import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [/* NotificationsModule */],
  controllers: [ExercisesController],
  providers: [ExercisesService, AuthorizationService],
})
export class ExercisesModule {}
