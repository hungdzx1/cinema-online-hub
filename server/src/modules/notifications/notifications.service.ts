import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
  ) {}

  // Tạo thông báo (admin / hệ thống gọi)
  async create(dto: CreateNotificationDto): Promise<NotificationEntity> {
    const noti = new NotificationEntity();
    noti.userId = dto.userId;
    noti.title = dto.title;
    if (dto.content) noti.content = dto.content;
    if (dto.type) noti.type = dto.type;
    if (dto.link) noti.link = dto.link;
    return this.notificationRepository.save(noti);
  }

  // Danh sách thông báo của user (mới nhất trước)
  async findByUser(userId: number): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Đếm số thông báo CHƯA đọc (cho badge số đỏ)
  async countUnread(userId: number): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  // Đánh dấu 1 thông báo đã đọc
  async markAsRead(id: number, userId: number): Promise<NotificationEntity> {
    const noti = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (!noti) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }
    noti.isRead = true;
    return this.notificationRepository.save(noti);
  }

  // Đánh dấu TẤT CẢ đã đọc
  async markAllAsRead(userId: number): Promise<{ message: string }> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { message: 'Đã đánh dấu tất cả là đã đọc' };
  }

  // Xóa thông báo
  async remove(id: number, userId: number): Promise<{ message: string }> {
    const noti = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (!noti) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }
    await this.notificationRepository.remove(noti);
    return { message: 'Đã xóa thông báo' };
  }
}
