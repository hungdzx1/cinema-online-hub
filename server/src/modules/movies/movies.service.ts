import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movies.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { RandomMovieFilterDto } from './dto/random-movie-filter.dto';
import { FilterMovieDto } from './dto/filter-movie.dto';
import { slugify } from '../../common/utils/slugify.util';
import { Episode } from '../episodes/episode.entity';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
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

  // Danh sách tất cả phim (admin) — bao gồm cả ẩn
  async findAllAdmin(): Promise<Movie[]> {
    return this.movieRepository.find({
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
    const movie = await this.movieRepository.findOne({ 
      where: { slug },
      relations: { genres: true, countries: true }
    });
    if (!movie) {
      this.logger.warn(`Không tìm thấy phim slug=${slug}`);
      throw new NotFoundException(`Không tìm thấy phim: ${slug}`);
    }
    await this.movieRepository.increment({ id: movie.id }, 'viewCount', 1);
    return movie;
  }

  // Lấy chi tiết trang xem phim công khai (gồm phim, thể loại, các tập phim, phim liên quan)
  async getMovieDetail(slug: string) {
    const movie = await this.movieRepository.findOne({
      where: { slug, isVisible: true },
      relations: { genres: true, countries: true },
    });
    if (!movie) {
      this.logger.warn(`Public detail: Không tìm thấy phim slug=${slug}`);
      throw new NotFoundException(`Không tìm thấy phim: ${slug}`);
    }

    // Tăng lượt xem phim khi xem chi tiết
    await this.movieRepository.increment({ id: movie.id }, 'viewCount', 1);
    movie.viewCount += 1;

    // Lấy danh sách các tập phim
    const episodes = await this.episodeRepository.find({
      where: { movieId: movie.id },
      order: { episodeNumber: 'ASC' },
    });

    // Lấy phim liên quan (chia sẻ cùng ít nhất 1 thể loại)
    const genreIds = movie.genres.map((g) => g.id);
    let relatedMovies: Movie[] = [];
    if (genreIds.length > 0) {
      relatedMovies = await this.movieRepository
        .createQueryBuilder('movie')
        .innerJoin('movie.genres', 'genre')
        .where('genre.id IN (:...genreIds)', { genreIds })
        .andWhere('movie.id != :movieId', { movieId: movie.id })
        .andWhere('movie.isVisible = :visible', { visible: true })
        .groupBy('movie.id')
        .limit(6)
        .getMany();
    }

    return {
      movie,
      episodes,
      genres: movie.genres,
      relatedMovies,
    };
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

  // ===== RANDOM NHANH: lấy đúng 1 phim ngẫu nhiên =====
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

  // ===== RANDOM NÂNG CAO: lọc theo điều kiện rồi random trong nhóm thỏa điều kiện =====
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

    if (genreIds && genreIds.length > 0) {
      qb.innerJoin('movie.genres', 'genre', 'genre.id IN (:...genreIds)', {
        genreIds,
      })
        .groupBy('movie.id')
        .having('COUNT(DISTINCT genre.id) = :genreCount', {
          genreCount: genreIds.length,
        });
    }

    qb.orderBy('RAND()').limit(limit);

    const movies = await qb.getMany();

    if (movies.length === 0) {
      this.logger.warn(
        `Random nâng cao: không có phim thỏa điều kiện (type=${type}, status=${status}, genreIds=${genreIds})`,
      );
    }

    return this.sortByCriteria(movies, sortBy);
  }

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

  // ===== THÊM MỚI — BỘ LỌC: lọc nhiều điều kiện AND + sắp xếp + phân trang =====
  async filterMovies(filters: FilterMovieDto) {
    const {
      keyword,
      countryId,
      country,
      type,
      status,
      genreIds,
      releaseYear,
      sortBy = 'newest',
      page = 1,
      limit = 20,
    } = filters;

    const applyFilters = (queryBuilder) => {
      queryBuilder.where('movie.isVisible = :visible', { visible: true });

      if (keyword) {
        queryBuilder.andWhere(
          '(LOWER(movie.title) LIKE LOWER(:keyword) OR LOWER(movie.slug) LIKE LOWER(:keyword))',
          { keyword: `%${keyword}%` },
        );
      }

      if (type) {
        queryBuilder.andWhere('movie.type = :type', { type });
      }

      if (status) {
        queryBuilder.andWhere('movie.status = :status', { status });
      }

      if (releaseYear) {
        queryBuilder.andWhere('movie.releaseYear = :releaseYear', { releaseYear });
      }

      if (countryId || country) {
        const countryVal = country || countryId;
        if (!isNaN(Number(countryVal))) {
          queryBuilder.innerJoin('movie.countries', 'country', 'country.id = :cId', {
            cId: Number(countryVal),
          });
        } else {
          queryBuilder.innerJoin('movie.countries', 'country', 'LOWER(country.slug) = LOWER(:cSlug)', {
            cSlug: String(countryVal).toLowerCase(),
          });
        }
      }

      if (genreIds && genreIds.length > 0) {
        queryBuilder.innerJoin('movie.genres', 'genre', 'genre.id IN (:...genreIds)', {
          genreIds,
        })
          .groupBy('movie.id')
          .having('COUNT(DISTINCT genre.id) = :genreCount', {
            genreCount: genreIds.length,
          });
      }
    };

    const qb = this.movieRepository.createQueryBuilder('movie');
    applyFilters(qb);

    // Sắp xếp kết quả
    switch (sortBy) {
      case 'rating':
      case 'imdb':
        qb.orderBy('movie.avgRating', 'DESC');
        break;
      case 'views':
        qb.orderBy('movie.viewCount', 'DESC');
        break;
      case 'newest':
      default:
        qb.orderBy('movie.createdAt', 'DESC');
        break;
    }

    // Lấy tổng số lượng dòng kết quả an toàn
    let total = 0;
    if (genreIds && genreIds.length > 0) {
      // Khi dùng GROUP BY / HAVING, count bằng cách lấy độ dài danh sách ID thô
      const countQb = this.movieRepository.createQueryBuilder('movie');
      applyFilters(countQb);
      const countRows = await countQb.select('movie.id').getRawMany();
      total = countRows.length;
    } else {
      const countQb = this.movieRepository.createQueryBuilder('movie');
      applyFilters(countQb);
      total = await countQb.getCount();
    }

    // Phân trang
    qb.limit(limit).offset((page - 1) * limit);

    const data = await qb.getMany();
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return { data, total, page, limit, totalPages, hasMore };
  }
}
