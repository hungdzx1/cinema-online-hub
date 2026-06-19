import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
  ) {}

  // Đánh giá phim - đã đánh giá thì cập nhật (upsert theo user+movie)
  async rate(userId: number, dto: CreateRatingDto): Promise<Rating> {
    const existed = await this.ratingRepository.findOne({
      where: { userId, movieId: dto.movieId },
    });

    if (existed) {
      existed.score = dto.score;
      if (dto.content !== undefined) existed.content = dto.content;
      return this.ratingRepository.save(existed);
    }

    const rating = new Rating();
    rating.userId = userId;
    rating.movieId = dto.movieId;
    rating.score = dto.score;
    if (dto.content) rating.content = dto.content;
    return this.ratingRepository.save(rating);
  }

  // Danh sách đánh giá của 1 phim
  async findByMovie(movieId: number): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { movieId },
      order: { createdAt: 'DESC' },
    });
  }

  // ==================== THÊM HÀM NÀY VÀO ĐÂY ====================
  // Xem điểm mình đã đánh giá cho 1 bộ phim cụ thể
  async getUserRating(userId: number, movieId: number): Promise<Rating | null> {
    return this.ratingRepository.findOne({
      where: { userId, movieId },
    });
  }
  // ==============================================================

  // Xóa đánh giá của mình
  async remove(userId: number, movieId: number): Promise<{ message: string }> {
    const rating = await this.ratingRepository.findOne({
      where: { userId, movieId },
    });
    if (!rating) {
      throw new NotFoundException('Bạn chưa đánh giá phim này');
    }
    await this.ratingRepository.remove(rating);
    return { message: 'Đã xóa đánh giá' };
  }
}
