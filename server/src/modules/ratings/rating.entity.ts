import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ratings')
export class Rating {
  // Khóa chính kép - khớp schema, KHÔNG có cột id
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'movie_id' })
  movieId: number;

  @Column({ type: 'tinyint' })
  score: number; // 1-10

  @Column({ type: 'text', nullable: true })
  content: string; // Nội dung đánh giá (schema có cột này)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
