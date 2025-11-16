import { ConfigService } from '@nestjs/config';
import { BookingsService } from '../bookings/bookings.service';
export declare class PaymentService {
    private configService;
    private bookingsService;
    private omise;
    constructor(configService: ConfigService, bookingsService: BookingsService);
    createPaymentIntent(bookingId: string, amount: number, metadata?: Record<string, any>): Promise<{
        chargeId: any;
        authorizeUri: any;
    }>;
    checkPaymentStatus(chargeId: string): Promise<{
        status: any;
        paid: any;
        amount: number;
        metadata: any;
    }>;
    handleWebhook(payload: any): Promise<{
        received: boolean;
    }>;
}
