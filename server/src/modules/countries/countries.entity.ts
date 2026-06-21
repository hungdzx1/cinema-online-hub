import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 120, unique: true })
  slug: string;
}
