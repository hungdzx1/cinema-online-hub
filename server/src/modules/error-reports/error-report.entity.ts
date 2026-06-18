import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ErrorType } from '../../common/enums/error-type.enum';
import { ReportStatus } from '../../common/enums/report-status.enum';

@Entity('error_reports')
export class ErrorReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'movie_id' })
  movieId: number;

  @Column({ name: 'episode_id', nullable: true })
  episodeId: number; // Tập bị lỗi (null nếu lỗi chung của phim)

  @Column({ name: 'error_type', type: 'enum', enum: ErrorType })
  errorType: ErrorType; // video_not_load | wrong_episode | ...

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả thêm

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus; // pending | resolved | ignored

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
