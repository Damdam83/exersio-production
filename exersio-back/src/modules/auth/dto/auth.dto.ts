import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Coach Demo' })
  @IsNotEmpty() name: string;

  @ApiProperty({ example: 'demo@exersio.app' })
  @IsEmail() email: string;

  @ApiProperty({ minLength: 6, example: 'demo1234' })
  @MinLength(6) password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'demo@exersio.app' })
  @IsEmail() email: string;

  @ApiProperty({ example: 'demo1234' })
  @IsNotEmpty() password: string;
}
