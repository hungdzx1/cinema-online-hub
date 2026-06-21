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
import { Country } from '../countries/countries.entity';
// ⚠️ KIỂM TRA: dòng import Country ở trên — mở file countries.entity.ts của bạn
// xem tên class có đúng là "Country" và đường dẫn '../countries/countries.entity'
// có khớp không (sửa cho đúng nếu khác tên file/class)

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

  // ===== Quan hệ thể loại — dùng cho Random nâng cao + Bộ lọc (lọc AND theo thể loại) =====
  @ManyToMany(() => Genre)
  @JoinTable({
    name: 'movie_genres',
    joinColumn: { name: 'movie_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres: Genre[];

  // ===== THÊM MỚI — Quan hệ quốc gia, dùng cho Bộ lọc (lọc theo quốc gia) =====
  // Tái dùng bảng trung gian movie_countries có sẵn trong DB (movie_id, country_id)
  @ManyToMany(() => Country)
  @JoinTable({
    name: 'movie_countries',
    joinColumn: { name: 'movie_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'country_id', referencedColumnName: 'id' },
  })
  countries: Country[];
}
