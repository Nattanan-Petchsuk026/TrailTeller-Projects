import { PaymentService } from './payment.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createIntent(body: CreatePaymentIntentDto): Promise<{
        success: boolean;
        data: {
            chargeId: string;
            authorizeUri: string;
        };
    } | {
        success: boolean;
        message: any;
        data: null;
    }>;
    webhook(payload: any, signature: string): Promise<{
        received: boolean;
        error?: undefined;
    } | {
        received: boolean;
        error: any;
    }>;
    checkStatus(chargeId: string): Promise<{
        success: boolean;
        data: {
            status: any;
            paid: any;
            amount: number;
            metadata: any;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data: null;
    }>;
}
