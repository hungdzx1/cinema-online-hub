import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FavoritesService } from '../favorites.service';
import { Favorite } from '../favorite.entity';

describe('FavoritesService (Unit Tests)', () => {
  let service: FavoritesService;

  // Khai báo kiểu tường minh cho repo để tránh lỗi ESLint (no-explicit-any)
  let repo: {
    findOne: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    remove: jest.Mock;
  };

  const mockFavorite: Partial<Favorite> = {
    userId: 1,
    movieId: 10,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      save: jest.fn().mockResolvedValue(mockFavorite),
      find: jest.fn().mockResolvedValue([mockFavorite]),
      remove: jest.fn().mockResolvedValue(mockFavorite),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: getRepositoryToken(Favorite), useValue: repo },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('add', () => {
    it('thêm phim vào yêu thích thành công', async () => {
      repo.findOne.mockResolvedValue(null); // Chưa có trong DB
      const result = await service.add(1, 10);
      expect(result).toEqual(mockFavorite);
      expect(repo.save).toHaveBeenCalledWith({ userId: 1, movieId: 10 });
    });

    it('báo lỗi ConflictException nếu phim đã có trong yêu thích', async () => {
      repo.findOne.mockResolvedValue(mockFavorite); // Đã có trong DB
      await expect(service.add(1, 10)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByUser', () => {
    it('trả về danh sách phim yêu thích của user', async () => {
      const result = await service.findByUser(1);
      expect(result).toEqual([mockFavorite]);
      expect(repo.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('remove', () => {
    it('xóa phim khỏi danh sách yêu thích', async () => {
      repo.findOne.mockResolvedValue(mockFavorite);
      const result = await service.remove(1, 10);
      expect(result).toEqual({ message: 'Đã bỏ khỏi yêu thích' });
    });

    it('báo lỗi NotFoundException nếu phim không có trong yêu thích', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(1, 99)).rejects.toThrow(NotFoundException);
    });
  });
});
