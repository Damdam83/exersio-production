import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Coach Demo' })
  @IsNotEmpty() name: string;

  @ApiProperty({ example: 'demo@exersio.app' })
  @IsEmail() email: string;

  @ApiProperty({ minLength: 6, example: 'demo1234' })
  @MinLength(6) password: string;

  @ApiPropertyOptional({ example: 'sport_id_123', description: 'ID du sport préféré de l\'utilisateur' })
  @IsOptional()
  @IsString()
  preferredSportId?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'demo@exersio.app' })
  @IsEmail() email: string;

  @ApiProperty({ example: 'demo1234' })
  @IsNotEmpty() password: string;
}
