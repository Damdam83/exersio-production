import { IsEmail, IsOptional, IsString, MinLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Jane Doe' }) @IsString() name: string;
  @ApiProperty({ example: 'jane@example.com' }) @IsEmail() email: string;
  @ApiPropertyOptional({ enum: ['coach','assistant','admin'] }) @IsOptional() @IsIn(['coach','assistant','admin']) role?: 'coach'|'assistant'|'admin';
  @ApiPropertyOptional({ minLength: 6 }) @IsOptional() @MinLength(6) password?: string;
}
export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ enum: ['coach','assistant','admin'] }) @IsOptional() @IsIn(['coach','assistant','admin']) role?: 'coach'|'assistant'|'admin';
  @ApiPropertyOptional({ minLength: 6 }) @IsOptional() @MinLength(6) password?: string;
}
