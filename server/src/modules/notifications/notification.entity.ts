import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

// Đặt tên NotificationEntity tránh trùng type "Notification" của trình duyệt
@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  // Schema dùng ENUM('new_episode', 'system')
  @Column({ type: 'enum', enum: ['new_episode', 'system'], default: 'system' })
  type: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  // Schema dùng tên cột link_url (KHÔNG phải link)
  @Column({ name: 'link_url', length: 500, nullable: true })
  linkUrl: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
