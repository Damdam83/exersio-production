import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExerciseDto {
  @ApiProperty({ example: 'Service / Réception' }) @IsString() name: string;
  @ApiProperty({ example: 'Échauffement avec passes' }) @IsString() description: string;
  @ApiProperty({ example: 15, minimum: 1 }) @IsInt() @Min(1) duration: number;

  // Anciens champs (rétrocompatibilité)
  @ApiPropertyOptional({ example: 'échauffement', deprecated: true }) @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional({ example: 'tous', deprecated: true }) @IsOptional() @IsString() ageCategory?: string;

  // Nouveaux champs (préférés)
  @ApiPropertyOptional({ example: 'cat_cuid123' }) @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional({ example: 'age_cuid456' }) @IsOptional() @IsString() ageCategoryId?: string;

  @ApiProperty({ example: 'volleyball' }) @IsString() sport: string;
  @ApiProperty({ type: [String], example: ['Étape 1','Étape 2'] }) @IsArray() instructions: string[];
  @ApiPropertyOptional({ example: { shapes: [] } }) @IsOptional() fieldData?: any;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isPublic?: boolean;
  @ApiPropertyOptional({ example: 'intermédiaire' }) @IsOptional() @IsString() level?: string;
  @ApiPropertyOptional({ example: 'modérée' }) @IsOptional() @IsString() intensity?: string;
  @ApiPropertyOptional({ example: 4 }) @IsOptional() @IsNumber() playersMin?: number;
  @ApiPropertyOptional({ example: 12 }) @IsOptional() @IsNumber() playersMax?: number;
  @ApiPropertyOptional({ example: 'Conseil: posture' }) @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ type: [String], example: ['service','réception'] }) @IsOptional() tags?: string[];
  @ApiPropertyOptional({ type: [String], example: ['Réceptionner 8/10 balles', 'Position correcte maintenue'] }) @IsOptional() successCriteria?: string[];
  @ApiPropertyOptional({ example: 'clb_123' }) @IsOptional() @IsString() clubId?: string;
}
export class UpdateExerciseDto extends CreateExerciseDto {}
