import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../../mail/mail.service';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

describe('AuthService (Unit Tests)', () => {
  let service: AuthService;
  let userRepository: any;
  let usersService: any;
  let jwtService: any;
  let mailService: any;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    role: 'USER',
    isBanned: false,
  };

  beforeEach(async () => {
    userRepository = {
      create: jest.fn().mockImplementation((dto) => ({ ...dto })),
      save: jest.fn().mockImplementation((user) => {
        user.id = 1;
        return Promise.resolve(user);
      }),
      findOne: jest.fn(),
    };

    usersService = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findById: jest.fn(),
      updateLastLogin: jest.fn().mockResolvedValue(undefined),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
    };

    mailService = {
      sendResetPasswordEmail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('thành công khi thông tin hợp lệ', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(null);

      const dto = { username: 'newuser', email: 'new@example.com', password: 'Password123!' };
      const result = await service.register(dto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(usersService.findByUsername).toHaveBeenCalledWith(dto.username);
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Đăng ký thành công', userId: 1 });
    });

    it('báo lỗi ConflictException nếu Email đã tồn tại', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      const dto = { username: 'newuser', email: 'test@example.com', password: 'Password123!' };

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('báo lỗi ConflictException nếu Username đã tồn tại', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(mockUser);
      const dto = { username: 'testuser', email: 'new@example.com', password: 'Password123!' };

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('đăng nhập thành công và trả về accessToken', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const dto = { email: 'test@example.com', password: 'Password123!' };
      const result = await service.login(dto);

      expect(result).toHaveProperty('accessToken', 'mock.jwt.token');
      expect(result.user.email).toEqual(mockUser.email);
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('báo lỗi UnauthorizedException nếu email không tồn tại', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const dto = { email: 'wrong@example.com', password: 'Password123!' };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('báo lỗi UnauthorizedException nếu tài khoản bị khóa (isBanned = true)', async () => {
      usersService.findByEmail.mockResolvedValue({ ...mockUser, isBanned: true });
      const dto = { email: 'test@example.com', password: 'Password123!' };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('báo lỗi UnauthorizedException nếu sai mật khẩu', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const dto = { email: 'test@example.com', password: 'wrongpassword' };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
