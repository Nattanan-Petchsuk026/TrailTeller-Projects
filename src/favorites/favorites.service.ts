import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

export interface CreateFavoriteDto {
  userId: string;
  destination: string;
  country?: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  aiSuggestions?: any;
}

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  /**
   * เพิ่มสถานที่โปรด
   */
  async create(createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    const favorite = this.favoriteRepository.create(createFavoriteDto);
    return await this.favoriteRepository.save(favorite);
  }

  /**
   * ดึงสถานที่โปรดทั้งหมดของ user
   */
  async findAllByUser(userId: string): Promise<Favorite[]> {
    return await this.favoriteRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * ดึงสถานที่โปรดตาม ID
   */
  async findOne(id: string, userId: string): Promise<Favorite> {
    const favorite = await this.favoriteRepository.findOne({
      where: { id, userId },
    });

    if (!favorite) {
      throw new NotFoundException('ไม่พบสถานที่โปรดนี้');
    }

    return favorite;
  }

  /**
   * ลบสถานที่โปรด
   */
  async remove(id: string, userId: string): Promise<void> {
    const favorite = await this.findOne(id, userId);
    await this.favoriteRepository.remove(favorite);
  }

  /**
   * ตรวจสอบว่ามีสถานที่นี้ในโปรดแล้วหรือยัง
   */
  async checkExists(userId: string, destination: string): Promise<boolean> {
    const count = await this.favoriteRepository.count({
      where: { userId, destination },
    });
    return count > 0;
  }

  /**
   * นับจำนวนสถานที่โปรด
   */
  async countByUser(userId: string): Promise<number> {
    return await this.favoriteRepository.count({
      where: { userId },
    });
  }
}
