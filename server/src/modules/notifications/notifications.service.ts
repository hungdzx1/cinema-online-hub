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

  async create(dto: CreateNotificationDto): Promise<NotificationEntity> {
    const noti = new NotificationEntity();
    noti.userId = dto.userId;
    noti.title = dto.title;
    if (dto.content) noti.content = dto.content;
    if (dto.type) noti.type = dto.type;
    if (dto.linkUrl) noti.linkUrl = dto.linkUrl;
    return this.notificationRepository.save(noti);
  }

  async findByUser(userId: number): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async countUnread(userId: number): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

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

  async markAllAsRead(userId: number): Promise<{ message: string }> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { message: 'Đã đánh dấu tất cả là đã đọc' };
  }

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
