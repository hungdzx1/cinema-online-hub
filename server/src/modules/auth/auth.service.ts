import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // ── ĐĂNG KÝ ──────────────────────────────────────────
  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    // Kiểm tra email đã tồn tại chưa
    const existedEmail = await this.usersService.findByEmail(email);
    if (existedEmail) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Kiểm tra username đã tồn tại chưa
    const existedUsername = await this.usersService.findByUsername(username);
    if (existedUsername) {
      throw new ConflictException('Tên đăng nhập đã được sử dụng');
    }

    // Mã hóa mật khẩu
    const passwordHash = await bcrypt.hash(password, 12);

    // Tạo user mới
    const user = this.userRepository.create({
      username,
      email,
      passwordHash,
    });
    await this.userRepository.save(user);

    return { message: 'Đăng ký thành công', userId: user.id };
  }

  // ── ĐĂNG NHẬP ────────────────────────────────────────
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Tìm user theo email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra tài khoản bị khóa
    if (user.isBanned) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Cập nhật lần đăng nhập gần nhất
    await this.usersService.updateLastLogin(user.id);

    // Tạo JWT token
    const token = this.generateToken(user);

    return {
      message: 'Đăng nhập thành công',
      accessToken: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  // ── ĐỔI MẬT KHẨU ─────────────────────────────────────
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const { oldPassword, newPassword } = dto;

    const user = await this.usersService.findById(userId);

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    // Mã hóa và lưu mật khẩu mới
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.save(user);

    return { message: 'Đổi mật khẩu thành công' };
  }

  // ── TẠO JWT TOKEN ────────────────────────────────────
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
