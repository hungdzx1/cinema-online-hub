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
  ) {}

  // Lưu tiến độ xem — đã xem tập này thì cập nhật, chưa thì tạo mới
  async saveProgress(
    userId: number,
    dto: SaveProgressDto,
  ): Promise<WatchHistory> {
    const existed = await this.historyRepository.findOne({
      where: { userId, episodeId: dto.episodeId },
    });

    if (existed) {
      // Đã xem tập này → cập nhật tiến độ mới
      existed.progressSeconds = dto.progressSeconds ?? 0;
      return this.historyRepository.save(existed);
    }

    // Chưa xem → tạo bản ghi mới
    const history = new WatchHistory();
    history.userId = userId;
    history.movieId = dto.movieId;
    history.episodeId = dto.episodeId;
    history.progressSeconds = dto.progressSeconds ?? 0;
    return this.historyRepository.save(history);
  }

  // Lịch sử xem của user (mới nhất trước) — phim "Xem tiếp"
  async findByUser(userId: number): Promise<WatchHistory[]> {
    return this.historyRepository.find({
      where: { userId },
      order: { lastWatchedAt: 'DESC' },
    });
  }

  // Xóa 1 bản ghi lịch sử
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

  // Xóa toàn bộ lịch sử xem của user
  async clearAll(userId: number): Promise<{ message: string }> {
    await this.historyRepository.delete({ userId });
    return { message: 'Đã xóa toàn bộ lịch sử xem' };
  }
}
