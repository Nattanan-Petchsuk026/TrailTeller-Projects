import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import type { CreateExpenseDto, UpdateExpenseDto } from './expenses.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('expenses')
@UseGuards(AuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createExpenseDto: CreateExpenseDto) {
    const expense = await this.expensesService.create(createExpenseDto);
    return {
      success: true,
      message: 'บันทึกค่าใช้จ่ายสำเร็จ',
      data: expense,
    };
  }

  @Get('trip/:tripId')
  async findAllByTrip(@Param('tripId') tripId: string) {
    const expenses = await this.expensesService.findAllByTrip(tripId);
    return { success: true, data: expenses };
  }

  @Get('trip/:tripId/total')
  async getTotalByTrip(@Param('tripId') tripId: string) {
    const total = await this.expensesService.getTotalByTrip(tripId);
    return { success: true, data: { total } };
  }

  @Get('trip/:tripId/summary')
  async getSummary(@Param('tripId') tripId: string) {
    const summary = await this.expensesService.getSummaryByCategory(tripId);
    return { success: true, data: summary };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const expense = await this.expensesService.findOne(id);
    return { success: true, data: expense };
  }

  @Patch(':id')
  // eslint-disable-next-line prettier/prettier
  async update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.expensesService.update(id, updateExpenseDto);
    return { success: true, message: 'อัปเดตสำเร็จ', data: expense };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.expensesService.remove(id);
  }
}
