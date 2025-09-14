import { IsArray, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ example: 'Séance du mardi' }) @IsString() name: string;
  @ApiPropertyOptional({ example: 'Préparation match' }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: '2025-08-20T18:30:00.000Z' }) @IsDateString() date: string;
  @ApiProperty({ example: 90, minimum: 1 }) @IsInt() @Min(1) duration: number;
  @ApiProperty({ type: [String], example: ['ex_1','ex_2'] }) @IsArray() exercises: string[];
  @ApiPropertyOptional({ type: [String], example: ['service','réception'] }) @IsOptional() objectives?: string[];
  @ApiPropertyOptional({ example: 'clb_123' }) @IsOptional() @IsString() clubId?: string;
  @ApiPropertyOptional({ example: 'volleyball' }) @IsOptional() @IsString() sport?: string;
  @ApiPropertyOptional({ example: 'sénior' }) @IsOptional() @IsString() ageCategory?: string;
  @ApiPropertyOptional({ example: 'débutant' }) @IsOptional() @IsString() level?: string;
  @ApiPropertyOptional({ enum: ['planned','completed','cancelled','in-progress'] }) @IsOptional() @IsString() status?: 'planned'|'completed'|'cancelled'|'in-progress';
  @ApiPropertyOptional({ example: 'Focus: réception' }) @IsOptional() @IsString() notes?: string;
}
export class UpdateSessionDto extends CreateSessionDto {}
