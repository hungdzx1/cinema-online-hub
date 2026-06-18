import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  // Thêm phim vào yêu thích
  async add(userId: number, movieId: number): Promise<Favorite> {
    const existed = await this.favoriteRepository.findOne({
      where: { userId, movieId },
    });
    if (existed) {
      throw new ConflictException('Phim đã có trong danh sách yêu thích');
    }

    const favorite = new Favorite();
    favorite.userId = userId;
    favorite.movieId = movieId;
    return this.favoriteRepository.save(favorite);
  }

  // Lấy danh sách phim yêu thích của user
  async findByUser(userId: number): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Kiểm tra phim đã được yêu thích chưa (cho UI hiện tym đỏ/trắng)
  async isFavorite(userId: number, movieId: number): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, movieId },
    });
    return !!favorite; // có → true, không → false
  }

  // Bỏ phim khỏi yêu thích
  async remove(userId: number, movieId: number): Promise<{ message: string }> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, movieId },
    });
    if (!favorite) {
      throw new NotFoundException('Phim không có trong danh sách yêu thích');
    }
    await this.favoriteRepository.remove(favorite);
    return { message: 'Đã bỏ khỏi yêu thích' };
  }
}
