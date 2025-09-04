import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClubDto {
  @ApiProperty({ example: 'Volley Club Demo' }) @IsString() name: string;
  @ApiPropertyOptional({ example: 'Club de démonstration' }) @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ example: 'https://cdn.exersio.app/logos/club.png' }) @IsOptional() @IsString() logo?: string | null;
}
export class UpdateClubDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logo?: string | null;
}
