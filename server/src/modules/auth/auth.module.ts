import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './auth.strategy';
import { UsersModule } from '../users/users.module';
import { DatabaseModule } from '../../database/Database.module';

@Module({
  imports: [
    DatabaseModule, // Cần USER_REPOSITORY
    UsersModule, // Dùng UsersService (đã export)
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: 900 }, // 15 phút = 900 giây
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
