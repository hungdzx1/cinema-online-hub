import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isBanned: true,
        createdAt: true,
        lastLogin: true,
      },
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Không tìm thấy user #${id}`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.userRepository.update(id, { lastLogin: new Date() });
  }

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
