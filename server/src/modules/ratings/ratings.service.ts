import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { Movie } from '../movies/movies.entity';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  // Cập nhật lại điểm trung bình và lượt đánh giá của phim
  private async updateMovieRatingStats(movieId: number): Promise<void> {
    const stats = await this.ratingRepository
      .createQueryBuilder('r')
      .select('AVG(r.score)', 'avgRating')
      .addSelect('COUNT(r.userId)', 'ratingCount')
      .where('r.movieId = :movieId', { movieId })
      .getRawOne();

    const rawAvg = parseFloat(stats?.avgRating) || 0;
    const avgRating = Math.round(rawAvg * 10) / 10;
    const ratingCount = parseInt(stats?.ratingCount, 10) || 0;

    await this.movieRepository.update(movieId, {
      avgRating,
      ratingCount,
    });
  }

  // Đánh giá phim - đã đánh giá thì cập nhật (upsert theo user+movie)
  async rate(userId: number, dto: CreateRatingDto): Promise<Rating> {
    const existed = await this.ratingRepository.findOne({
      where: { userId, movieId: dto.movieId },
    });

    let savedRating: Rating;
    if (existed) {
      existed.score = dto.score;
      if (dto.content !== undefined) existed.content = dto.content;
      savedRating = await this.ratingRepository.save(existed);
    } else {
      const rating = new Rating();
      rating.userId = userId;
      rating.movieId = dto.movieId;
      rating.score = dto.score;
      if (dto.content) rating.content = dto.content;
      savedRating = await this.ratingRepository.save(rating);
    }

    // Tự động tính lại điểm trung bình phim
    await this.updateMovieRatingStats(dto.movieId);

    return savedRating;
  }

  // Danh sách đánh giá của 1 phim
  async findByMovie(movieId: number): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { movieId },
      order: { createdAt: 'DESC' },
    });
  }

  // Xem điểm mình đã đánh giá cho 1 bộ phim cụ thể
  async getUserRating(userId: number, movieId: number): Promise<Rating | null> {
    return this.ratingRepository.findOne({
      where: { userId, movieId },
    });
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

    // Tự động tính lại điểm trung bình phim
    await this.updateMovieRatingStats(movieId);

    return { message: 'Đã xóa đánh giá' };
  }
}
