import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Movie } from '../movies/movies.entity';

@Entity('watchlist')
export class Watchlist {
  // Khóa chính kép (user_id + movie_id) - khớp schema, KHÔNG có cột id
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'movie_id' })
  movieId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Movie, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;
}

