import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MovieType } from '../../common/enums/movie-type.enum';
import { MovieStatus } from '../../common/enums/movie-status.enum';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 280, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'poster_url', length: 500, nullable: true })
  posterUrl: string;

  @Column({ name: 'banner_url', length: 500, nullable: true })
  bannerUrl: string;

  @Column({ type: 'enum', enum: MovieType })
  type: MovieType;

  @Column({ type: 'enum', enum: MovieStatus, default: MovieStatus.ONGOING })
  status: MovieStatus;

  @Column({ name: 'release_year', type: 'int', nullable: true })
  releaseYear: number;

  @Column({ name: 'total_episodes', type: 'int', default: 0 })
  totalEpisodes: number;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'avg_rating', type: 'float', default: 0 })
  avgRating: number;

  @Column({ name: 'rating_count', type: 'int', default: 0 })
  ratingCount: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ name: 'schedule_date', type: 'datetime', nullable: true })
  scheduleDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
