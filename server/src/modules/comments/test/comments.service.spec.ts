import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException } from '@nestjs/common';
import { CommentsService } from '../comments.service';
import { CommentEntity } from '../comment.entity';

jest.mock('sanitize-html', () => ({
  __esModule: true,
  default: jest.fn((content: string) =>
    content.replace(/<script.*<\/script>/g, ''),
  ),
}));

describe('CommentsService (Unit Tests)', () => {
  let service: CommentsService;

  // Khai báo kiểu tường minh cho repo để tránh lỗi ESLint (no-explicit-any)
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
  };

  const mockComment: Partial<CommentEntity> = {
    id: 1,
    userId: 1,
    movieId: 10,
    content: 'Phim hay quá',
    isHidden: false,
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockImplementation((dto) => dto as CommentEntity),
      save: jest.fn().mockResolvedValue(mockComment),
      find: jest.fn().mockResolvedValue([mockComment]),
      findOne: jest.fn().mockResolvedValue(mockComment),
      remove: jest.fn().mockResolvedValue(mockComment),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(CommentEntity), useValue: repo },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('tạo bình luận mới thành công', async () => {
      const dto = { movieId: 10, content: 'Phim hay' };
      const result = await service.create(1, dto);
      expect(result).toEqual(mockComment);
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('findByMovie', () => {
    it('trả về danh sách bình luận theo movieId', async () => {
      const result = await service.findByMovie(10);
      expect(result).toEqual([mockComment]);
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('cho phép user xóa bình luận của chính mình', async () => {
      const result = await service.remove(1, 1);
      expect(result).toEqual({ message: 'Đã xóa bình luận' });
    });

    it('báo lỗi ForbiddenException nếu user xóa bình luận của người khác', async () => {
      await expect(service.remove(1, 2)).rejects.toThrow(ForbiddenException);
    });
  });
});
