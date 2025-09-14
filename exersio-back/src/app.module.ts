import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AppVersionModule } from './modules/app/app.module';
import { LoggerModule } from './common/logger/logger.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
// import { SetupController } from './setup-admin.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ClubsModule,
    ExercisesModule,
    SessionsModule,
    InvitationsModule,
    CategoriesModule,
    FavoritesModule,
    NotificationsModule,
    AppVersionModule,
  ],
  controllers: [/* SetupController */],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
