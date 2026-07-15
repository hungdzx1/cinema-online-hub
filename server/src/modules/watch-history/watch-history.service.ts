import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchHistory } from './watch-history.entity';
import { SaveProgressDto } from './dto/save-progress.dto';

@Injectable()
export class WatchHistoryService {
  constructor(
    @InjectRepository(WatchHistory)
    private historyRepository: Repository<WatchHistory>,
  ) { }

  async saveProgress(
    userId: number,
    dto: SaveProgressDto,
  ): Promise<WatchHistory> {
    const existed = await this.historyRepository.findOne({
      where: { userId, episodeId: dto.episodeId },
    });

    if (existed) {
      if (dto.progressSeconds !== undefined) {
        existed.progressSeconds = dto.progressSeconds;
      }
      return this.historyRepository.save(existed);
    }

    const history = new WatchHistory();
    history.userId = userId;
    history.movieId = dto.movieId;
    history.episodeId = dto.episodeId;
    history.progressSeconds = dto.progressSeconds ?? 0;
    return this.historyRepository.save(history);
  }

  // Lịch sử xem (mới nhất trước) - dùng watchedAt
  async findByUser(userId: number): Promise<WatchHistory[]> {
    return this.historyRepository.find({
      where: { userId },
      relations: { movie: true, episode: true },
      order: { watchedAt: 'DESC' },
    });
  }

  async remove(userId: number, id: number): Promise<{ message: string }> {
    const history = await this.historyRepository.findOne({
      where: { id, userId },
    });
    if (!history) {
      throw new NotFoundException('Không tìm thấy lịch sử xem');
    }
    await this.historyRepository.remove(history);
    return { message: 'Đã xóa khỏi lịch sử' };
  }

  async clearAll(userId: number): Promise<{ message: string }> {
    await this.historyRepository.delete({ userId });
    return { message: 'Đã xóa toàn bộ lịch sử xem' };
  }
}
