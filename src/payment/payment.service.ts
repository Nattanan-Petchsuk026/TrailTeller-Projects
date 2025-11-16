/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable prettier/prettier */
// src/payment/payment.service.ts
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Omise = require('omise');
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class PaymentService {
  private omise: any;

  constructor(
    private configService: ConfigService,
    private bookingsService: BookingsService,
  ) {
    const secretKey = this.configService.get<string>('OMISE_SECRET_KEY');
    const publicKey = this.configService.get<string>('OMISE_PUBLIC_KEY');

    if (!secretKey || !publicKey) {
      throw new InternalServerErrorException(
        'Omise keys are not configured. Please set OMISE_SECRET_KEY and OMISE_PUBLIC_KEY in env.',
      );
    }

    this.omise = Omise({
      secretKey: secretKey!,
      publicKey: publicKey!,
    });
  }

  /**
   * 💳 สร้าง Payment Intent (เตรียมหน้าชำระเงิน)
   * ✅ รองรับ metadata และลองหลาย Payment Methods
   * ✅ ใช้ Deep Link สำหรับ return_uri
   */
  async createPaymentIntent(
    bookingId: string,
    amount: number,
    metadata?: Record<string, any>,
  ) {
    try {
      const booking = await this.bookingsService.findOne(bookingId);

      if (!booking) {
        throw new BadRequestException('ไม่พบการจองนี้');
      }

      if (booking.status !== 'pending') {
        throw new BadRequestException('การจองนี้ไม่อยู่ในสถานะรอชำระเงิน');
      }

      // ✅ ลองหลาย Payment Methods (Auto-Fallback)
      const methodsToTry = [
        'internet_banking_scb',
        'internet_banking_kbank',
        'mobile_banking_kbank',
        'mobile_banking_scb',
        'promptpay',
        'rabbit_linepay',
        'internet_banking_bbl',
        'internet_banking_ktb',
        'internet_banking_bay',
      ];

      let lastError;
      for (const method of methodsToTry) {
        try {
          console.log(`🔄 Trying payment method: ${method}`);
          
          const charge = await this.omise.charges.create({
            amount: Math.round(amount * 100),
            currency: 'THB',
            description: `Booking: ${booking.title}`,
            source: { 
              type: method,
              // ✅ เพิ่ม platform_type เพื่อให้ทำงานบน Mobile
              platform_type: 'IOS' // หรือ 'ANDROID' (Omise จะ detect อัตโนมัติ)
            },
            metadata: {
              bookingId: booking.id,
              ...metadata,
            },
            // ✅ เปลี่ยนเป็น Deep Link (กลับมาแอพโดยตรง)
            return_uri: 'mytrip://payment-success',
            // ✅ บังคับให้ redirect ทันที (ไม่รอ 3DS)
            zero_interest_installments: false,
          });

          console.log(`✅ Payment method ${method} worked!`, {
            chargeId: charge.id,
            amount: charge.amount,
            authorizeUri: charge.authorize_uri,
          });

          return {
            chargeId: charge.id,
            authorizeUri: charge.authorize_uri,
          };
          
        } catch (error) {
          console.log(`❌ Payment method ${method} failed:`, error.message);
          lastError = error;
          continue;
        }
      }

      // ถ้าลองทุกวิธีแล้วไม่มีวิธีไหนทำงาน
      console.error('❌ All payment methods failed. Last error:', lastError);
      throw new BadRequestException(
        'ไม่พบช่องทางชำระเงินที่ใช้ได้\n\nกรุณาติดต่อผู้ดูแลระบบเพื่อเปิดใช้งาน Payment Methods ใน Omise Dashboard'
      );
      
    } catch (error) {
      console.error('Create Payment Intent Error:', error);
      throw new BadRequestException(
        error.message || 'ไม่สามารถสร้างการชำระเงินได้'
      );
    }
  }

  /**
   * ✅ ตรวจสอบสถานะการชำระเงิน
   */
  async checkPaymentStatus(chargeId: string) {
    try {
      const charge = await this.omise.charges.retrieve(chargeId);
      return {
        status: charge.status,
        paid: charge.paid,
        amount: charge.amount / 100,
        metadata: charge.metadata,
      };
    } catch (error) {
      console.error('Check Payment Status Error:', error);
      throw new BadRequestException('ไม่สามารถตรวจสอบสถานะได้');
    }
  }

  /**
   * 🔔 Webhook Handler - รับการแจ้งเตือนจาก Omise
   * ✅ รองรับหลาย bookings
   */
  async handleWebhook(payload: any) {
    try {
      const { key, data } = payload;

      if (key === 'charge.complete') {
        const charge = data;
        const bookingId = charge.metadata?.bookingId;

        if (charge.paid && bookingId) {
          // ✅ อัปเดต booking หลัก
          await this.bookingsService.updateStatus(bookingId, 'confirmed');
          console.log(`✅ Booking ${bookingId} ชำระเงินสำเร็จ`);

          // ✅ อัปเดต bookings อื่นๆ
          if (charge.metadata?.bookingIds) {
            const bookingIds = charge.metadata.bookingIds.split(',');
            for (const id of bookingIds) {
              try {
                await this.bookingsService.updateStatus(id.trim(), 'confirmed');
                console.log(`✅ Booking ${id.trim()} ชำระเงินสำเร็จ`);
              } catch (error) {
                console.error(`❌ Failed to update booking ${id}:`, error);
              }
            }
          }
        } else if (!charge.paid && bookingId) {
          // กรณีชำระเงินไม่สำเร็จ
          await this.bookingsService.updateStatus(bookingId, 'cancelled');
          console.log(`❌ Booking ${bookingId} ชำระเงินไม่สำเร็จ`);

          if (charge.metadata?.bookingIds) {
            const bookingIds = charge.metadata.bookingIds.split(',');
            for (const id of bookingIds) {
              try {
                await this.bookingsService.updateStatus(id.trim(), 'cancelled');
                console.log(`❌ Booking ${id.trim()} ยกเลิก`);
              } catch (error) {
                console.error(`❌ Failed to cancel booking ${id}:`, error);
              }
            }
          }
        }
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook Error:', error);
      throw error;
    }
  }
}