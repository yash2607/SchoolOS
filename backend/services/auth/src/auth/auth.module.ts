import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { JwtTokenService } from './jwt-token.service';
import { JwtStrategy } from './jwt.strategy';
import { RedisProvider } from './redis.provider';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { Session } from '../entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, School, Session]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    JwtTokenService,
    JwtStrategy,
    RedisProvider,
  ],
})
export class AuthModule {}
