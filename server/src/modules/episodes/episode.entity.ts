import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('episodes')
export class Episode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'movie_id' })
  movieId: number; // Khóa ngoại tới movies

  @Column({ name: 'episode_number' })
  episodeNumber: number;

  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ name: 'embed_url', length: 500 })
  embedUrl: string; // Link video nhúng (iframe) - quan trọng nhất

  @Column({ name: 'server_name', length: 100, default: 'Server 1' })
  serverName: string;

  @Column({ name: 'skip_intro_seconds', type: 'int', default: 0 })
  skipIntroSeconds: number;

  @Column({ name: 'duration_seconds', type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
