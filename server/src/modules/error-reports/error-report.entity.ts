import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
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
  episodeId: number;

  @Column({ name: 'error_type', type: 'enum', enum: ErrorType })
  errorType: ErrorType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  // Schema có admin_note (ghi chú của admin khi xử lý)
  @Column({ name: 'admin_note', type: 'text', nullable: true })
  adminNote: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Schema KHÔNG có updated_at → bỏ @UpdateDateColumn
}
