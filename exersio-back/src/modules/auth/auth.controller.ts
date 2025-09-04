import { Body, Controller, Get, Post, Req, UseGuards, Query, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh JWT' })
  refresh(@Req() req: any) {
    return this.auth.refresh(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (stateless)' })
  logout() {
    return { message: 'Logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile' })
  profile(@Req() req: any) {
    return this.auth.profile(req.user.id);
  }

  @Get('confirm-email')
  @ApiOperation({ summary: 'Confirm email address with token' })
  @ApiQuery({ name: 'token', description: 'Email verification token' })
  confirmEmail(@Query('token') token: string) {
    return this.auth.confirmEmail(token);
  }

  @Post('resend-confirmation')
  @ApiOperation({ summary: 'Resend confirmation email' })
  resendConfirmation(@Body('email') email: string) {
    return this.auth.resendConfirmationEmail(email);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  forgotPassword(@Body('email') email: string) {
    return this.auth.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.auth.resetPassword(body.token, body.newPassword);
  }

  @Post('dev/activate-email')
  @ApiOperation({ summary: 'DEV ONLY - Activate email without token' })
  devActivateEmail(@Body() body: { email: string }) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('This endpoint is only available in development');
    }
    return this.auth.devActivateEmail(body.email);
  }
}
