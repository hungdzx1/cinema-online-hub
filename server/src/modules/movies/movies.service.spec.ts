import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './movies.entity';
import { Episode } from '../episodes/episode.entity';

describe('MoviesService (Unit Tests)', () => {
  let service: MoviesService;
  let movieRepo: any;
  let episodeRepo: any;

  const mockMovie: Partial<Movie> = {
    id: 1,
    title: 'Lật Mặt 7: Một Điều Ước',
    slug: 'lat-mat-7-mot-dieu-uoc',
    description: 'Phim tình cảm gia đình cảm động',
    releaseYear: 2024,
    viewCount: 100,
    avgRating: 4.8,
    isVisible: true,
    genres: [],
    countries: [],
  };

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockMovie]),
      getOne: jest.fn().mockResolvedValue(mockMovie),
      getCount: jest.fn().mockResolvedValue(1),
      getRawMany: jest.fn().mockResolvedValue([{ id: 1 }]),
    };

    movieRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((movie) => Promise.resolve({ id: 1, ...movie })),
      find: jest.fn().mockResolvedValue([mockMovie]),
      findOne: jest.fn().mockResolvedValue(mockMovie),
      increment: jest.fn().mockResolvedValue({ affected: 1 }),
      remove: jest.fn().mockResolvedValue(mockMovie),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    episodeRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: getRepositoryToken(Movie), useValue: movieRepo },
        { provide: getRepositoryToken(Episode), useValue: episodeRepo },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('tạo phim mới và tự động sinh slug', async () => {
      const dto = {
        title: 'Bố Già 2026',
        description: 'Phim truyền hình Việt Nam',
        releaseYear: 2026,
      };

      const result = await service.create(dto as any);
      expect(result.slug).toBe('bo-gia-2026');
      expect(movieRepo.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('trả về bộ phim khi ID tồn tại', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockMovie);
      expect(movieRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('báo lỗi NotFoundException khi ID không tồn tại', async () => {
      movieRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('trả về phim và tự động tăng viewCount', async () => {
      const result = await service.findBySlug('lat-mat-7-mot-dieu-uoc');
      expect(result).toEqual(mockMovie);
      expect(movieRepo.increment).toHaveBeenCalledWith({ id: 1 }, 'viewCount', 1);
    });
  });

  describe('remove', () => {
    it('xóa phim thành công', async () => {
      const result = await service.remove(1);
      expect(result).toEqual({ message: 'Đã xóa phim "Lật Mặt 7: Một Điều Ước" thành công' });
      expect(movieRepo.remove).toHaveBeenCalledWith(mockMovie);
    });
  });
});
