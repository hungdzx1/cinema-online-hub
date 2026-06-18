import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Episode } from './episode.entity';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
  ) {}

  // Thêm tập mới (admin)
  async create(dto: CreateEpisodeDto): Promise<Episode> {
    const episode = this.episodeRepository.create(dto);
    return this.episodeRepository.save(episode);
  }

  // Lấy danh sách tập của 1 phim — sắp xếp theo số tập
  async findByMovie(movieId: number): Promise<Episode[]> {
    return this.episodeRepository.find({
      where: { movieId },
      order: { episodeNumber: 'ASC' },
    });
  }

  // Xem 1 tập theo id — tăng lượt xem
  async findOne(id: number): Promise<Episode> {
    const episode = await this.episodeRepository.findOne({ where: { id } });
    if (!episode) {
      throw new NotFoundException(`Không tìm thấy tập với ID: ${id}`);
    }
    // Tăng view_count mỗi lần xem
    await this.episodeRepository.increment({ id }, 'viewCount', 1);
    return episode;
  }

  // Cập nhật tập (admin)
  async update(id: number, dto: UpdateEpisodeDto): Promise<Episode> {
    const episode = await this.findOne(id);
    Object.assign(episode, dto);
    return this.episodeRepository.save(episode);
  }

  // Xóa tập (admin)
  async remove(id: number): Promise<{ message: string }> {
    const episode = await this.episodeRepository.findOne({ where: { id } });
    if (!episode) {
      throw new NotFoundException(`Không tìm thấy tập với ID: ${id}`);
    }
    await this.episodeRepository.remove(episode);
    return { message: 'Đã xóa tập thành công' };
  }
}
