import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('watch_history')
@Unique(['userId', 'episodeId']) // Mỗi tập 1 bản ghi tiến độ / user
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
  progressSeconds: number; // Xem đến giây thứ mấy

  @UpdateDateColumn({ name: 'last_watched_at' })
  lastWatchedAt: Date; // Tự cập nhật mỗi lần lưu
}
