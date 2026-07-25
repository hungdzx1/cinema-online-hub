import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { User } from '../user.entity';
import { UserRole } from '../../../common/enums/user-role.enum';

describe('UsersService (Unit Tests)', () => {
  let service: UsersService;

  // Khai báo kiểu tường minh cho repo để tránh lỗi any của ESLint
  let repo: {
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const mockUser: User = {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    passwordHash: 'hashed_password',
    role: UserRole.USER,
    isBanned: false,
    avatarUrl: null as unknown as string, // Đã chuẩn kiểu string | null ở entity
    resetToken: null,
    resetTokenExpires: null,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repo = {
      find: jest.fn().mockResolvedValue([mockUser]),
      findOne: jest.fn().mockResolvedValue(mockUser),
      save: jest.fn().mockImplementation((user: User) => Promise.resolve(user)),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      remove: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('trả về danh sách người dùng', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(repo.find).toHaveBeenCalledWith({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isBanned: true,
          avatarUrl: true,
          createdAt: true,
          lastLogin: true,
        },
      });
    });
  });

  describe('findById', () => {
    it('trả về user khi ID tồn tại', async () => {
      const result = await service.findById(1);
      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('báo lỗi NotFoundException khi ID không tồn tại', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleBan', () => {
    it('khóa tài khoản nếu đang hoạt động', async () => {
      const result = await service.toggleBan(1);
      expect(result.isBanned).toBe(true);
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('xóa thành công người dùng', async () => {
      await service.remove(1);
      expect(repo.remove).toHaveBeenCalledWith(mockUser);
    });
  });
});
