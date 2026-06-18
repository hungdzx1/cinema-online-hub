import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('watchlist')
export class Watchlist {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'movie_id' })
  movieId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
