import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import type { CreateBookingDto, UpdateBookingDto } from './bookings.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BookingType } from './entities/booking.entity';

@Controller('bookings')
@UseGuards(AuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * POST /bookings - สร้างการจองใหม่
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBookingDto: CreateBookingDto) {
    const booking = await this.bookingsService.create(createBookingDto);
    return {
      success: true,
      message: 'จองสำเร็จ',
      data: booking,
    };
  }

  /**
   * GET /bookings/trip/:tripId - ดึงการจองทั้งหมดของทริป
   */
  @Get('trip/:tripId')
  async findAllByTrip(@Param('tripId') tripId: string) {
    const bookings = await this.bookingsService.findAllByTrip(tripId);
    return { success: true, data: bookings };
  }

  /**
   * GET /bookings/trip/:tripId/type/:type - ดึงการจองตามประเภท
   */
  @Get('trip/:tripId/type/:type')
  async findByType(
    @Param('tripId') tripId: string,
    @Param('type') type: BookingType,
  ) {
    const bookings = await this.bookingsService.findByType(tripId, type);
    return { success: true, data: bookings };
  }

  /**
   * GET /bookings/trip/:tripId/total - ยอดรวมค่าจอง
   */
  @Get('trip/:tripId/total')
  async getTotalCost(@Param('tripId') tripId: string) {
    const total = await this.bookingsService.getTotalCost(tripId);
    return { success: true, data: { total } };
  }

  /**
   * GET /bookings/trip/:tripId/summary - สรุปการจองแยกตามประเภท
   */
  @Get('trip/:tripId/summary')
  async getSummary(@Param('tripId') tripId: string) {
    const summary = await this.bookingsService.getSummaryByType(tripId);
    return { success: true, data: summary };
  }

  /**
   * 🏨 GET /bookings/search/hotels - ค้นหาโรงแรม
   */
  @Get('search/hotels')
  async searchHotels(
    @Query('destination') destination: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
    @Query('guests') guests: number,
  ) {
    const hotels = await this.bookingsService.searchHotels({
      destination,
      checkIn,
      checkOut,
      guests: guests || 2,
    });
    return { success: true, data: hotels };
  }

  /**
   * 🍽️ GET /bookings/search/restaurants - ค้นหาร้านอาหาร
   */
  @Get('search/restaurants')
  async searchRestaurants(
    @Query('destination') destination: string,
    @Query('date') date: string,
    @Query('partySize') partySize: number,
    @Query('cuisine') cuisine?: string,
  ) {
    const restaurants = await this.bookingsService.searchRestaurants({
      destination,
      date,
      partySize: partySize || 2,
      cuisine,
    });
    return { success: true, data: restaurants };
  }

  /**
   * ✈️ GET /bookings/search/flights - ค้นหาเที่ยวบิน
   */
  @Get('search/flights')
  async searchFlights(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('departureDate') departureDate: string,
    @Query('returnDate') returnDate?: string,
    @Query('passengers') passengers?: number,
    @Query('seatClass') seatClass?: string,
  ) {
    const flights = await this.bookingsService.searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers: passengers || 1,
      seatClass,
    });
    return { success: true, data: flights };
  }

  /**
   * GET /bookings/:id - ดึงการจองเดียว
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const booking = await this.bookingsService.findOne(id);
    return { success: true, data: booking };
  }

  /**
   * PATCH /bookings/:id - อัปเดตการจอง
   */
  @Patch(':id')
  // eslint-disable-next-line prettier/prettier
  async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    const booking = await this.bookingsService.update(id, updateBookingDto);
    return { success: true, message: 'อัปเดตสำเร็จ', data: booking };
  }

  /**
   * DELETE /bookings/:id - ยกเลิกการจอง
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.bookingsService.remove(id);
  }
}
