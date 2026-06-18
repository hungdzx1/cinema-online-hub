import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorReport } from './error-report.entity';
import { CreateErrorReportDto } from './dto/create-error-report.dto';
import { ReportStatus } from '../../common/enums/report-status.enum';

@Injectable()
export class ErrorReportsService {
  constructor(
    @InjectRepository(ErrorReport)
    private reportRepository: Repository<ErrorReport>,
  ) {}

  // User gửi báo lỗi
  async create(
    userId: number,
    dto: CreateErrorReportDto,
  ): Promise<ErrorReport> {
    const report = new ErrorReport();
    report.userId = userId;
    report.movieId = dto.movieId;
    report.errorType = dto.errorType;
    if (dto.episodeId) report.episodeId = dto.episodeId;
    if (dto.description) report.description = dto.description;
    return this.reportRepository.save(report);
  }

  // Báo lỗi của chính user
  async findByUser(userId: number): Promise<ErrorReport[]> {
    return this.reportRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Admin xem TẤT CẢ báo lỗi
  async findAll(): Promise<ErrorReport[]> {
    return this.reportRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Admin cập nhật trạng thái (pending → resolved/ignored)
  async updateStatus(id: number, status: ReportStatus): Promise<ErrorReport> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Không tìm thấy báo lỗi #${id}`);
    }
    report.status = status;
    return this.reportRepository.save(report);
  }

  // Xóa báo lỗi (admin)
  async remove(id: number): Promise<{ message: string }> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Không tìm thấy báo lỗi #${id}`);
    }
    await this.reportRepository.remove(report);
    return { message: 'Đã xóa báo lỗi' };
  }
}
