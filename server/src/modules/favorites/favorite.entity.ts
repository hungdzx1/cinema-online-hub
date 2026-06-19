import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('favorites')
export class Favorite {
  // Khóa chính kép (user_id + movie_id) - khớp schema, KHÔNG có cột id
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'movie_id' })
  movieId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
