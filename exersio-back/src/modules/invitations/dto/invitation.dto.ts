import { IsEmail, IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({ example: 'assistant@club.com' }) @IsEmail() email: string;
  @ApiProperty({ enum: ['coach','assistant'], example: 'assistant' }) @IsIn(['coach','assistant']) role: 'coach'|'assistant';
  @ApiProperty({ example: 'clb_123' }) @IsString() clubId: string;
}

export class UpdateInvitationStatusDto {
  @ApiProperty({ enum: ['pending','accepted','declined'], example: 'accepted' }) @IsIn(['pending','accepted','declined']) status: 'pending'|'accepted'|'declined';
}
