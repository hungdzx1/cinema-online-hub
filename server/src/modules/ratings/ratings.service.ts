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

  // Đánh giá phim — mỗi user chỉ 1 điểm/phim (có thì cập nhật, chưa thì tạo)
  async rate(userId: number, dto: CreateRatingDto): Promise<Rating> {
    const existed = await this.ratingRepository.findOne({
      where: { userId, movieId: dto.movieId },
    });

    if (existed) {
      // Đã đánh giá rồi → cập nhật điểm mới
      existed.score = dto.score;
      return this.ratingRepository.save(existed);
    }

    // Chưa đánh giá → tạo mới
    const rating = new Rating();
    rating.userId = userId;
    rating.movieId = dto.movieId;
    rating.score = dto.score;
    return this.ratingRepository.save(rating);
  }

  // Lấy điểm user đã đánh giá cho 1 phim
  async getUserRating(userId: number, movieId: number): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { userId, movieId },
    });
    if (!rating) {
      throw new NotFoundException('Bạn chưa đánh giá phim này');
    }
    return rating;
  }

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
