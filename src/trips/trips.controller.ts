import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import type { CreateTripDto, UpdateTripDto } from './trips.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { RequestWithUser } from '../types/request-with-user.interface';
import type { TripStatus } from './entities/trip.entity';

@Controller('trips')
@UseGuards(AuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  /**
   * POST /trips - สร้างทริปใหม่
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTripDto: CreateTripDto,
    @Request() req: RequestWithUser,
  ) {
    const trip = await this.tripsService.create({
      ...createTripDto,
      userId: req.user.sub,
    });

    return {
      success: true,
      message: 'สร้างทริปสำเร็จ',
      data: trip,
    };
  }

  /**
   * GET /trips - ดึงทริปทั้งหมดของ user
   */
  @Get()
  async findAll(@Request() req: RequestWithUser) {
    const trips = await this.tripsService.findAllByUser(req.user.sub);
    return {
      success: true,
      data: trips,
    };
  }

  /**
   * GET /trips/count - นับจำนวนทริป
   */
  @Get('count')
  async count(@Request() req: RequestWithUser) {
    const count = await this.tripsService.countByUser(req.user.sub);
    return {
      success: true,
      data: { count },
    };
  }

  /**
   * GET /trips/stats - ดึงสถิติทริป
   */
  @Get('stats')
  async getStats(@Request() req: RequestWithUser) {
    const stats = await this.tripsService.getStats(req.user.sub);
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * GET /trips/status/:status - ดึงทริปตาม status
   */
  @Get('status/:status')
  async findByStatus(
    @Param('status') status: TripStatus,
    @Request() req: RequestWithUser,
  ) {
    const trips = await this.tripsService.findByStatus(req.user.sub, status);
    return {
      success: true,
      data: trips,
    };
  }

  /**
   * GET /trips/:id - ดึงทริปเดียว
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    const trip = await this.tripsService.findOne(id, req.user.sub);
    return {
      success: true,
      data: trip,
    };
  }

  /**
   * PATCH /trips/:id - อัปเดตทริป
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
    @Request() req: RequestWithUser,
  ) {
    const trip = await this.tripsService.update(
      id,
      req.user.sub,
      updateTripDto,
    );
    return {
      success: true,
      message: 'อัปเดตทริปสำเร็จ',
      data: trip,
    };
  }

  /**
   * DELETE /trips/:id - ลบทริป
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.tripsService.remove(id, req.user.sub);
  }
}
