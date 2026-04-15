import { Controller, Post, Get, Body, Headers, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP to mobile number' })
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.mobile, dto.schoolCode);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP and get tokens' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.mobile, dto.otp, dto.schoolCode);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email or phone number and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.loginWithPassword(dto.identifier, dto.password, dto.schoolCode);
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Set or reset password using phone OTP' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPasswordWithOtp(
      dto.mobile,
      dto.otp,
      dto.newPassword,
      dto.schoolCode,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  getMe(@Request() req: { user: { sub: string } }) {
    return this.authService.getMe(req.user.sub);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke session' })
  logout(@Request() req: { user: { sessionId: string } }) {
    return this.authService.logout(req.user.sessionId);
  }
}
