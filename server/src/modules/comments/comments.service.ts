import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import sanitizeHtml from 'sanitize-html';
import { CommentEntity } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  // Tạo bình luận (user đã đăng nhập)
  async create(userId: number, dto: CreateCommentDto): Promise<CommentEntity> {
    const comment = new CommentEntity();
    comment.userId = userId;
    comment.movieId = dto.movieId;

    // CHỐNG XSS: làm sạch nội dung trước khi lưu
    // allowedTags: [] + allowedAttributes: {} → XÓA HẾT mọi thẻ HTML
    // "<script>alert('hack')</script>Phim hay" → "Phim hay"
    comment.content = sanitizeHtml(dto.content, {
      allowedTags: [],
      allowedAttributes: {},
    });

    if (dto.parentId) {
      comment.parentId = dto.parentId;
    }
    return this.commentRepository.save(comment);
  }

  // Lấy bình luận của 1 phim (chỉ hiện cái chưa bị ẩn)
  async findByMovie(movieId: number): Promise<CommentEntity[]> {
    return this.commentRepository.find({
      where: { movieId, isHidden: false },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Xóa bình luận của chính mình (user)
  async remove(id: number, userId: number): Promise<{ message: string }> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Không tìm thấy bình luận #${id}`);
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể xóa bình luận của mình');
    }

    await this.commentRepository.remove(comment);
    return { message: 'Đã xóa bình luận' };
  }

  // Admin ẩn/hiện bình luận
  async toggleHide(id: number): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Không tìm thấy bình luận #${id}`);
    }
    comment.isHidden = !comment.isHidden;
    return this.commentRepository.save(comment);
  }
}
