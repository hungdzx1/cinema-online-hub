import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Movie } from '../movies/movies.entity';
import { Episode } from '../episodes/episode.entity';

@Entity('watch_history')
@Unique(['userId', 'episodeId'])
export class WatchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'movie_id' })
  movieId: number;

  @Column({ name: 'episode_id' })
  episodeId: number;

  @Column({ name: 'progress_seconds', type: 'int', default: 0 })
  progressSeconds: number;

  // Schema dùng tên cột watched_at (KHÔNG phải last_watched_at)
  @UpdateDateColumn({ name: 'watched_at' })
  watchedAt: Date;

  @ManyToOne(() => Movie, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Episode, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'episode_id' })
  episode: Episode;
}
