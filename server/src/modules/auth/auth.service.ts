import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  // Logger riêng cho AuthService - log sẽ hiện [AuthService]
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // ── ĐĂNG KÝ ──────────────────────────────────────────
  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;
    this.logger.log(`Yêu cầu đăng ký: ${email}`);

    const existedEmail = await this.usersService.findByEmail(email);
    if (existedEmail) {
      this.logger.warn(`Đăng ký thất bại - email đã tồn tại: ${email}`);
      throw new ConflictException('Email đã được sử dụng');
    }

    const existedUsername = await this.usersService.findByUsername(username);
    if (existedUsername) {
      this.logger.warn(`Đăng ký thất bại - username đã tồn tại: ${username}`);
      throw new ConflictException('Tên đăng nhập đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = this.userRepository.create({ username, email, passwordHash });
    await this.userRepository.save(user);

    this.logger.log(`Đăng ký thành công: ${email} (id=${user.id})`);
    return { message: 'Đăng ký thành công', userId: user.id };
  }

  // ── ĐĂNG NHẬP ────────────────────────────────────────
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    this.logger.log(`Yêu cầu đăng nhập: ${email}`);

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`Đăng nhập thất bại - không tìm thấy: ${email}`);
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (user.isBanned) {
      this.logger.warn(`Đăng nhập bị chặn - tài khoản khóa: ${email}`);
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      this.logger.warn(`Đăng nhập thất bại - sai mật khẩu: ${email}`);
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    await this.usersService.updateLastLogin(user.id);
    const token = this.generateToken(user);

    this.logger.log(`Đăng nhập thành công: ${email} (role=${user.role})`);
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
    this.logger.log(`Yêu cầu đổi mật khẩu: user id=${userId}`);

    const user = await this.usersService.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      this.logger.warn(`Đổi mật khẩu thất bại - sai mật khẩu cũ: id=${userId}`);
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.save(user);

    this.logger.log(`Đổi mật khẩu thành công: id=${userId}`);
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
