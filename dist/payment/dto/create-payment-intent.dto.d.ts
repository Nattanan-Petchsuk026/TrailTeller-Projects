export declare class CreatePaymentIntentDto {
    bookingId: string;
    amount: number;
    metadata?: {
        tripId?: string;
        bookingIds?: string;
        itemCount?: number;
        [key: string]: any;
    };
}
