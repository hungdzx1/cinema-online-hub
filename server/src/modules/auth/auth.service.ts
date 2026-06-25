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
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { MailService } from '../../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

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

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.warn(`Forgot password: email không tồn tại - ${dto.email}`);
      return {
        message:
          'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await this.userRepository.save(user);

    await this.mailService.sendResetPasswordEmail(user.email, resetToken);
    this.logger.log(`Đã tạo token reset mật khẩu cho user id=${user.id}`);

    return {
      message:
        'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu.',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { resetToken: dto.token },
    });

    if (!user) {
      throw new BadRequestException('Mã đặt lại mật khẩu không hợp lệ');
    }

    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new BadRequestException(
        'Mã đặt lại mật khẩu đã hết hạn, vui lòng yêu cầu lại',
      );
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await this.userRepository.save(user);

    this.logger.log(`Đặt lại mật khẩu thành công cho user id=${user.id}`);
    return { message: 'Đặt lại mật khẩu thành công, vui lòng đăng nhập lại' };
  }
}
