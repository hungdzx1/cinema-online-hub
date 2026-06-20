import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Movie } from '../movies/movies.entity';
import { CommentEntity } from '../comments/comment.entity';
import { ErrorReport } from '../error-reports/error-report.entity';
import { ReportStatus } from '../../common/enums/report-status.enum';

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
  ) {}

  // Thống kê tổng quan cho dashboard
  async getDashboardStats() {
    this.logger.log('Truy cập dashboard thống kê');

    const [totalUsers, totalMovies, totalComments, pendingReports] =
      await Promise.all([
        this.userRepository.count(),
        this.movieRepository.count(),
        this.commentRepository.count(),
        this.reportRepository.count({
          where: { status: ReportStatus.PENDING },
        }),
      ]);

    return {
      totalUsers,
      totalMovies,
      totalComments,
      pendingReports,
    };
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
