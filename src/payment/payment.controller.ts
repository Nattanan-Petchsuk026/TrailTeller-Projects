/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * POST /payments/create-intent - สร้าง Payment Intent
   * ✅ ใช้ DTO จากไฟล์แยก
   */
  @Post('create-intent')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async createIntent(@Body() body: CreatePaymentIntentDto) {
    try {
      console.log('📥 Received payment request:', JSON.stringify(body, null, 2));

      const result = await this.paymentService.createPaymentIntent(
        body.bookingId,
        body.amount,
        body.metadata,
      );

      // ✅ ตรวจสอบว่า result มีข้อมูลครบถ้วน
      if (!result || !result.chargeId || !result.authorizeUri) {
        throw new Error('Invalid payment response from Omise');
      }

      // ✅ Return ในรูปแบบที่ชัดเจน
      const response = {
        success: true,
        data: {
          chargeId: String(result.chargeId),
          authorizeUri: String(result.authorizeUri),
        },
      };

      console.log('📤 Sending payment response:', JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      console.error('❌ Create Payment Intent Error:', error);
      return {
        success: false,
        message: error.message || 'ไม่สามารถสร้างการชำระเงินได้',
        data: null,
      };
    }
  }

  /**
   * POST /payments/webhook - รับ Webhook จาก Omise
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Body() payload: any,
    @Headers('x-omise-signature') signature: string,
  ) {
    try {
      console.log('🔔 Received webhook:', payload);
      await this.paymentService.handleWebhook(payload);
      return { received: true };
    } catch (error) {
      console.error('❌ Webhook Error:', error);
      return { received: false, error: error.message };
    }
  }

  /**
   * GET /payments/status/:chargeId - ตรวจสอบสถานะการชำระเงิน
   */
  @Get('status/:chargeId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async checkStatus(@Param('chargeId') chargeId: string) {
    try {
      const status = await this.paymentService.checkPaymentStatus(chargeId);
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      console.error('❌ Check Status Error:', error);
      return {
        success: false,
        message: error.message || 'ไม่สามารถตรวจสอบสถานะได้',
        data: null,
      };
    }
  }
}
