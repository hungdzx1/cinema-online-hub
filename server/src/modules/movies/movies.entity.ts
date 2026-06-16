import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string | undefined;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  poster_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  backdrop_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  trailer_url: string;

  @Column({ type: 'varchar', length: 20 })
  type: string; // 'SINGLE' | 'SERIES'

  @Column({ type: 'varchar', length: 20 })
  status: string; // 'ONGOING' | 'COMPLETED' | 'TRAILER'

  @Column({ type: 'int', nullable: true })
  release_year: number;

  @Column({ type: 'int', nullable: true })
  country_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
