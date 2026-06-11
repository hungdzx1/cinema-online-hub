import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  // Lấy tất cả users (Admin)
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'username', 'email', 'role', 'isBanned', 'createdAt', 'lastLogin'],
    });
  }

  // Tìm user theo ID
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Không tìm thấy user #${id}`);
    return user;
  }

  // Tìm user theo email (dùng cho Auth)
  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  // Tìm user theo username (dùng cho Auth)
  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  // Cập nhật thông tin cá nhân
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  // Cập nhật lastLogin khi đăng nhập
  async updateLastLogin(id: number): Promise<void> {
    await this.userRepository.update(id, { lastLogin: new Date() });
  }

  // Khóa / Mở khóa tài khoản (Admin)
  async toggleBan(id: number): Promise<User> {
    const user = await this.findById(id);
    user.isBanned = !user.isBanned;
    return this.userRepository.save(user);
  }

  // Xóa user (Admin)
  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }
}