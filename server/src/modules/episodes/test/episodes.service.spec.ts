import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { EpisodesService } from '../episodes.service';
import { Episode } from '../episode.entity';

describe('EpisodesService (Unit Tests)', () => {
  let service: EpisodesService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    increment: jest.Mock;
    remove: jest.Mock;
  };

  const mockEpisode: Partial<Episode> = {
    id: 1,
    movieId: 10,
    episodeNumber: 1,
    title: 'Tập 1',
    embedUrl: 'https://youtube.com/embed/test',
    serverName: 'Server 1',
    viewCount: 0,
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockImplementation((dto) => dto as Episode),
      save: jest.fn().mockResolvedValue(mockEpisode),
      find: jest.fn().mockResolvedValue([mockEpisode]),
      findOne: jest.fn().mockResolvedValue(mockEpisode),
      increment: jest.fn().mockResolvedValue({ affected: 1 }),
      remove: jest.fn().mockResolvedValue(mockEpisode),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EpisodesService,
        { provide: getRepositoryToken(Episode), useValue: repo },
      ],
    }).compile();

    service = module.get<EpisodesService>(EpisodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('thêm tập phim mới thành công', async () => {
      const dto = { movieId: 10, episodeNumber: 1, embedUrl: 'test' };
      const result = await service.create(dto);
      expect(result).toEqual(mockEpisode);
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('findByMovie', () => {
    it('trả về danh sách tập phim theo movieId', async () => {
      const result = await service.findByMovie(10);
      expect(result).toEqual([mockEpisode]);
      expect(repo.find).toHaveBeenCalledWith({
        where: { movieId: 10 },
        order: { episodeNumber: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('trả về tập phim và tự động tăng viewCount', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockEpisode);
      expect(repo.increment).toHaveBeenCalledWith({ id: 1 }, 'viewCount', 1);
    });

    it('báo lỗi NotFoundException nếu không tìm thấy tập phim', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('xóa tập phim thành công', async () => {
      const result = await service.remove(1);
      expect(result).toEqual({ message: 'Đã xóa tập thành công' });
      expect(repo.remove).toHaveBeenCalledWith(mockEpisode);
    });
  });
});
