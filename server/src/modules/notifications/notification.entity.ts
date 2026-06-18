import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

// Đặt tên NotificationEntity để tránh trùng type "Notification" có sẵn của trình duyệt
@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number; // Thông báo gửi cho ai

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ length: 50, nullable: true })
  type: string; // new_episode | report_reply | system...

  @Column({ length: 500, nullable: true })
  link: string; // Click thông báo → đi đến đâu

  @Column({ name: 'is_read', default: false })
  isRead: boolean; // Đã đọc chưa

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
