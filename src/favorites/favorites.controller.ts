import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import type { CreateFavoriteDto } from './favorites.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { RequestWithUser } from '../types/request-with-user.interface';

@Controller('favorites')
@UseGuards(AuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  /**
   * POST /favorites - เพิ่มสถานที่โปรด
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createFavoriteDto: Omit<CreateFavoriteDto, 'userId'>,
    @Request() req: RequestWithUser,
  ) {
    const favorite = await this.favoritesService.create({
      ...createFavoriteDto,
      userId: req.user.sub,
    });

    return {
      success: true,
      message: 'เพิ่มสถานที่โปรดสำเร็จ',
      data: favorite,
    };
  }

  /**
   * GET /favorites - ดึงสถานที่โปรดทั้งหมด
   */
  @Get()
  async findAll(@Request() req: RequestWithUser) {
    const favorites = await this.favoritesService.findAllByUser(req.user.sub);
    return {
      success: true,
      data: favorites,
    };
  }

  /**
   * GET /favorites/count - นับจำนวนสถานที่โปรด
   */
  @Get('count')
  async count(@Request() req: RequestWithUser) {
    const count = await this.favoritesService.countByUser(req.user.sub);
    return {
      success: true,
      data: { count },
    };
  }

  /**
   * GET /favorites/check/:destination - ตรวจสอบว่ามีในโปรดแล้วหรือยัง
   */
  @Get('check/:destination')
  async checkExists(
    @Param('destination') destination: string,
    @Request() req: RequestWithUser,
  ) {
    const exists = await this.favoritesService.checkExists(
      req.user.sub,
      destination,
    );
    return {
      success: true,
      data: { exists },
    };
  }

  /**
   * GET /favorites/:id - ดึงสถานที่โปรดเดียว
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    const favorite = await this.favoritesService.findOne(id, req.user.sub);
    return {
      success: true,
      data: favorite,
    };
  }

  /**
   * DELETE /favorites/:id - ลบสถานที่โปรด
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.favoritesService.remove(id, req.user.sub);
  }
}
