import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movies.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { RandomMovieFilterDto } from './dto/random-movie-filter.dto';
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

  // ===== THÊM MỚI — RANDOM NHANH: lấy đúng 1 phim ngẫu nhiên =====
  async getRandomOne(): Promise<Movie> {
    const movie = await this.movieRepository
      .createQueryBuilder('movie')
      .where('movie.isVisible = :visible', { visible: true })
      .orderBy('RAND()')
      .limit(1)
      .getOne();

    if (!movie) {
      this.logger.warn('Random nhanh: không có phim nào để random');
      throw new NotFoundException('Hiện chưa có phim nào để random');
    }
    return movie;
  }

  // ===== THÊM MỚI — RANDOM NÂNG CAO: lọc theo điều kiện rồi random trong nhóm thỏa điều kiện =====
  async getRandomAdvanced(filters: RandomMovieFilterDto): Promise<Movie[]> {
    const { type, status, genreIds, limit = 10, sortBy = 'view' } = filters;

    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .where('movie.isVisible = :visible', { visible: true });

    if (type) {
      qb.andWhere('movie.type = :type', { type });
    }
    if (status) {
      qb.andWhere('movie.status = :status', { status });
    }

    // Lọc theo thể loại — kết hợp AND (phim phải có ĐỦ tất cả thể loại đã chọn)
    if (genreIds && genreIds.length > 0) {
      qb.innerJoin('movie.genres', 'genre', 'genre.id IN (:...genreIds)', {
        genreIds,
      })
        .groupBy('movie.id')
        .having('COUNT(DISTINCT genre.id) = :genreCount', {
          genreCount: genreIds.length,
        });
    }

    // Random trong nhóm đã lọc, lấy đúng số lượng yêu cầu
    qb.orderBy('RAND()').limit(limit);

    const movies = await qb.getMany();

    if (movies.length === 0) {
      // Chuyển mảng thành chuỗi "1,2,3" hoặc in ra chữ "none" nếu undefined
      const genreIdsStr = genreIds ? genreIds.join(',') : 'none';

      this.logger.warn(
        `Random nâng cao: không có phim thỏa điều kiện (type=${type || 'all'}, status=${status || 'all'}, genreIds=${genreIdsStr})`,
      );
    }

    // Sắp xếp lại danh sách ĐÃ RANDOM theo tiêu chí hiển thị người dùng chọn
    return this.sortByCriteria(movies, sortBy);
  }

  // Sắp xếp danh sách phim đã random theo tiêu chí hiển thị
  // (like/comment tạm dùng viewCount vì DB chưa có cột đếm riêng)
  private sortByCriteria(movies: Movie[], sortBy: string): Movie[] {
    const sorted = [...movies];
    switch (sortBy) {
      case 'new':
        return sorted.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
      case 'view':
      case 'like':
      case 'comment':
      default:
        return sorted.sort((a, b) => b.viewCount - a.viewCount);
    }
  }
}
