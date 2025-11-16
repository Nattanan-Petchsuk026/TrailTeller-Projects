// src/payment/dto/create-payment-intent.dto.ts
import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  bookingId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsObject()
  metadata?: {
    tripId?: string;
    bookingIds?: string;
    itemCount?: number;
    [key: string]: any;
  };
}
