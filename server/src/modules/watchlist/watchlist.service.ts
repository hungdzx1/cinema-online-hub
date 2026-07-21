import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchlist } from './watchlist.entity';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private watchlistRepository: Repository<Watchlist>,
  ) {}

  // Thêm phim vào danh sách xem sau
  async add(userId: number, movieId: number): Promise<Watchlist> {
    const existed = await this.watchlistRepository.findOne({
      where: { userId, movieId },
    });
    if (existed) {
      throw new ConflictException('Phim đã có trong danh sách xem sau');
    }

    const item = new Watchlist();
    item.userId = userId;
    item.movieId = movieId;
    return this.watchlistRepository.save(item);
  }

  // Danh sách xem sau của user
  async findByUser(userId: number): Promise<Watchlist[]> {
    return this.watchlistRepository.find({
      where: { userId },
      relations: { movie: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Kiểm tra phim đã có trong danh sách chưa
  async isInWatchlist(userId: number, movieId: number): Promise<boolean> {
    const item = await this.watchlistRepository.findOne({
      where: { userId, movieId },
    });
    return !!item;
  }

  // Bỏ phim khỏi danh sách xem sau
  async remove(userId: number, movieId: number): Promise<{ message: string }> {
    const item = await this.watchlistRepository.findOne({
      where: { userId, movieId },
    });
    if (!item) {
      throw new NotFoundException('Phim không có trong danh sách xem sau');
    }
    await this.watchlistRepository.remove(item);
    return { message: 'Đã bỏ khỏi danh sách xem sau' };
  }
}
