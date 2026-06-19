import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

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
}
