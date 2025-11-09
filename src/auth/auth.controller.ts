import {
  Controller,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from './guards/auth.guard';
import type { RequestWithUser } from '../types/request-with-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ลงทะเบียน
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      message: 'ลงทะเบียนสำเร็จ',
      data: result,
    };
  }

  // เข้าสู่ระบบ
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: result,
    };
  }

  // ข้อมูลผู้ใช้ปัจจุบัน
  @Get('me')
  @UseGuards(AuthGuard)
  getProfile(@Request() req: RequestWithUser) {
    return {
      success: true,
      data: req.user,
    };
  }

  // อัปเดตโปรไฟล์ผู้ใช้ปัจจุบัน
  @Patch('me')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    // ✅ เปลี่ยนจาก req.user.id เป็น req.user.sub
    const updatedUser = await this.authService.updateProfile(
      req.user.sub, // ← ใช้ sub แทน id
      updateProfileDto,
    );
    return {
      success: true,
      message: 'อัปเดตโปรไฟล์สำเร็จ',
      data: updatedUser,
    };
  }
}
