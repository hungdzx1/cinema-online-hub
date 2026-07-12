import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Movie } from '../movies/movies.entity';
import { CommentEntity } from '../comments/comment.entity';
import { ErrorReport } from '../error-reports/error-report.entity';
import { Genre } from '../genres/genre.entity';
import { ReportStatus } from '../../common/enums/report-status.enum';
import { MovieType } from '../../common/enums/movie-type.enum';
import { MovieStatus } from '../../common/enums/movie-status.enum';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(ErrorReport)
    private reportRepository: Repository<ErrorReport>,
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
  ) {}

  // Thống kê tổng quan cho dashboard
  async getDashboardStats() {
    this.logger.log('Truy cập dashboard thống kê');

    const [
      totalUsers,
      totalMovies,
      totalPhimLe,
      totalPhimBo,
      totalOngoing,
      totalCompleted,
      totalComments,
      pendingReports,
    ] = await Promise.all([
      this.userRepository.count(),
      this.movieRepository.count(),
      this.movieRepository.count({ where: { type: MovieType.PHIM_LE } }),
      this.movieRepository.count({ where: { type: MovieType.PHIM_BO } }),
      this.movieRepository.count({ where: { status: MovieStatus.ONGOING } }),
      this.movieRepository.count({ where: { status: MovieStatus.COMPLETED } }),
      this.commentRepository.count(),
      this.reportRepository.count({
        where: { status: ReportStatus.PENDING },
      }),
    ]);

    // Tổng lượt xem
    const viewResult = await this.movieRepository
      .createQueryBuilder('movie')
      .select('SUM(movie.viewCount)', 'total')
      .getRawOne();

    return {
      totalUsers,
      totalMovies,
      totalPhimLe,
      totalPhimBo,
      totalOngoing,
      totalCompleted,
      totalViews: Number(viewResult?.total) || 0,
      totalComments,
      pendingReports,
    };
  }

  // Thống kê phim theo thể loại
  async getGenreStats() {
    this.logger.log('Lấy thống kê phim theo thể loại');

    const stats = await this.genreRepository
      .createQueryBuilder('genre')
      .leftJoin('movie_genres', 'mg', 'mg.genre_id = genre.id')
      .select('genre.name', 'name')
      .addSelect('COUNT(mg.movie_id)', 'count')
      .groupBy('genre.id')
      .orderBy('count', 'DESC')
      .getRawMany();

    return stats.map((s) => ({ name: s.name, count: Number(s.count) }));
  }

  // Top phim xem nhiều nhất
  async getTopMovies() {
    this.logger.log('Lấy top phim xem nhiều');
    return this.movieRepository.find({
      order: { viewCount: 'DESC' },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        avgRating: true,
      },
    });
  }

  // User mới đăng ký gần đây
  async getRecentUsers() {
    this.logger.log('Lấy danh sách user mới');
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
  }
}

