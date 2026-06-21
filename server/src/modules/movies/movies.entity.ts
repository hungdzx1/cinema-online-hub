import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { MovieType } from '../../common/enums/movie-type.enum';
import { MovieStatus } from '../../common/enums/movie-status.enum';
import { Genre } from '../genres/genre.entity';

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

  // ===== THÊM MỚI — phục vụ chức năng Random nâng cao (lọc theo thể loại) =====
  // Dùng lại đúng bảng trung gian "movie_genres" đã có sẵn trong DB (movie_id, genre_id)
  // Không tạo bảng mới, không đổi schema — chỉ khai báo quan hệ để TypeORM biết JOIN qua đâu
  @ManyToMany(() => Genre)
  @JoinTable({
    name: 'movie_genres',
    joinColumn: { name: 'movie_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres: Genre[];
}
