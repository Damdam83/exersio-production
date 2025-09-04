import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  data?: any;
}

export class RegisterPushTokenDto {
  @IsString()
  token: string;

  @IsEnum(['android', 'ios', 'web'])
  platform: string;
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  sessionReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  exerciseNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  systemNotifications?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(48)
  reminderHours?: number;
}

export class NotificationQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  unreadOnly?: boolean;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}