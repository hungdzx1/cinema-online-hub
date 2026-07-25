import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { GenresService } from '../genres.service';
import { Genre } from '../genre.entity';

describe('GenresService (Unit Tests)', () => {
  let service: GenresService;

  // Khai báo kiểu tường minh để tránh lỗi ESLint (no-explicit-any)
  let repo: {
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  let cacheManager: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };

  const mockGenre: Partial<Genre> = {
    id: 1,
    name: 'Hành Động',
    slug: 'hanh-dong',
    isVisible: true,
  };

  beforeEach(async () => {
    repo = {
      create: jest
        .fn()
        .mockImplementation((dto) => ({ id: 1, ...dto }) as Genre),
      find: jest.fn().mockResolvedValue([mockGenre]),
      findOne: jest.fn().mockResolvedValue(mockGenre),
      save: jest.fn().mockResolvedValue(mockGenre),
      remove: jest.fn().mockResolvedValue(mockGenre),
    };

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        { provide: getRepositoryToken(Genre), useValue: repo },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll (có cache)', () => {
    it('trả về dữ liệu từ cache nếu đã có', async () => {
      cacheManager.get.mockResolvedValue([mockGenre]);
      const result = await service.findAll();
      expect(result).toEqual([mockGenre]);
      expect(cacheManager.get).toHaveBeenCalledWith('genres_all');
      expect(repo.find).not.toHaveBeenCalled();
    });

    it('query DB và lưu vào cache nếu chưa có cache', async () => {
      cacheManager.get.mockResolvedValue(null);
      const result = await service.findAll();
      expect(result).toEqual([mockGenre]);
      expect(repo.find).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        'genres_all',
        [mockGenre],
        120000,
      );
    });
  });

  describe('create', () => {
    it('tạo thể loại mới và xóa cache cũ', async () => {
      // ✅ Phải mock findOne trả về null để service hiểu là chưa tồn tại
      repo.findOne.mockResolvedValue(null);

      const dto = { name: 'Phim Hài', slug: 'phim-hai' };
      const result = await service.create(dto);
      expect(result).toEqual(mockGenre);
      expect(repo.save).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalledWith('genres_all');
    });
  });
});
