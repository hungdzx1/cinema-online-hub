import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movies.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { slugify } from '../../common/utils/slugify.util';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  // Tạo phim mới (admin) — slug tự sinh từ title
  async create(dto: CreateMovieDto): Promise<Movie> {
    const slug = slugify(dto.title);
    const movie = this.movieRepository.create({ ...dto, slug });
    const saved = await this.movieRepository.save(movie);
    this.logger.log(`Tạo phim mới: "${saved.title}" (id=${saved.id})`);
    return saved;
  }

  // Danh sách phim đang hiển thị (public)
  async findAll(): Promise<Movie[]> {
    return this.movieRepository.find({
      where: { isVisible: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Chi tiết phim theo id
  async findOne(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      this.logger.warn(`Không tìm thấy phim id=${id}`);
      throw new NotFoundException(`Không tìm thấy phim với ID: ${id}`);
    }
    return movie;
  }

  // Chi tiết phim theo slug (public) — tăng lượt xem
  async findBySlug(slug: string): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { slug } });
    if (!movie) {
      this.logger.warn(`Không tìm thấy phim slug=${slug}`);
      throw new NotFoundException(`Không tìm thấy phim: ${slug}`);
    }
    await this.movieRepository.increment({ id: movie.id }, 'viewCount', 1);
    return movie;
  }

  // Cập nhật phim (admin)
  async update(id: number, dto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.findOne(id);

    if (dto.title) {
      movie.slug = slugify(dto.title);
    }

    Object.assign(movie, dto);
    const updated = await this.movieRepository.save(movie);
    this.logger.log(`Cập nhật phim: "${updated.title}" (id=${id})`);
    return updated;
  }

  // Xóa phim (admin)
  async remove(id: number): Promise<{ message: string }> {
    const movie = await this.findOne(id);
    await this.movieRepository.remove(movie);
    this.logger.log(`Xóa phim: "${movie.title}" (id=${id})`);
    return { message: `Đã xóa phim "${movie.title}" thành công` };
  }
}
