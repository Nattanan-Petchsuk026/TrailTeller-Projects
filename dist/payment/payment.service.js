"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Omise = require("omise");
const bookings_service_1 = require("../bookings/bookings.service");
let PaymentService = class PaymentService {
    configService;
    bookingsService;
    omise;
    constructor(configService, bookingsService) {
        this.configService = configService;
        this.bookingsService = bookingsService;
        const secretKey = this.configService.get('OMISE_SECRET_KEY');
        const publicKey = this.configService.get('OMISE_PUBLIC_KEY');
        if (!secretKey || !publicKey) {
            throw new common_1.InternalServerErrorException('Omise keys are not configured. Please set OMISE_SECRET_KEY and OMISE_PUBLIC_KEY in env.');
        }
        this.omise = Omise({
            secretKey: secretKey,
            publicKey: publicKey,
        });
    }
    async createPaymentIntent(bookingId, amount, metadata) {
        try {
            const booking = await this.bookingsService.findOne(bookingId);
            if (!booking) {
                throw new common_1.BadRequestException('ไม่พบการจองนี้');
            }
            if (booking.status !== 'pending') {
                throw new common_1.BadRequestException('การจองนี้ไม่อยู่ในสถานะรอชำระเงิน');
            }
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
                            platform_type: 'IOS'
                        },
                        metadata: {
                            bookingId: booking.id,
                            ...metadata,
                        },
                        return_uri: 'mytrip://payment-success',
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
                }
                catch (error) {
                    console.log(`❌ Payment method ${method} failed:`, error.message);
                    lastError = error;
                    continue;
                }
            }
            console.error('❌ All payment methods failed. Last error:', lastError);
            throw new common_1.BadRequestException('ไม่พบช่องทางชำระเงินที่ใช้ได้\n\nกรุณาติดต่อผู้ดูแลระบบเพื่อเปิดใช้งาน Payment Methods ใน Omise Dashboard');
        }
        catch (error) {
            console.error('Create Payment Intent Error:', error);
            throw new common_1.BadRequestException(error.message || 'ไม่สามารถสร้างการชำระเงินได้');
        }
    }
    async checkPaymentStatus(chargeId) {
        try {
            const charge = await this.omise.charges.retrieve(chargeId);
            return {
                status: charge.status,
                paid: charge.paid,
                amount: charge.amount / 100,
                metadata: charge.metadata,
            };
        }
        catch (error) {
            console.error('Check Payment Status Error:', error);
            throw new common_1.BadRequestException('ไม่สามารถตรวจสอบสถานะได้');
        }
    }
    async handleWebhook(payload) {
        try {
            const { key, data } = payload;
            if (key === 'charge.complete') {
                const charge = data;
                const bookingId = charge.metadata?.bookingId;
                if (charge.paid && bookingId) {
                    await this.bookingsService.updateStatus(bookingId, 'confirmed');
                    console.log(`✅ Booking ${bookingId} ชำระเงินสำเร็จ`);
                    if (charge.metadata?.bookingIds) {
                        const bookingIds = charge.metadata.bookingIds.split(',');
                        for (const id of bookingIds) {
                            try {
                                await this.bookingsService.updateStatus(id.trim(), 'confirmed');
                                console.log(`✅ Booking ${id.trim()} ชำระเงินสำเร็จ`);
                            }
                            catch (error) {
                                console.error(`❌ Failed to update booking ${id}:`, error);
                            }
                        }
                    }
                }
                else if (!charge.paid && bookingId) {
                    await this.bookingsService.updateStatus(bookingId, 'cancelled');
                    console.log(`❌ Booking ${bookingId} ชำระเงินไม่สำเร็จ`);
                    if (charge.metadata?.bookingIds) {
                        const bookingIds = charge.metadata.bookingIds.split(',');
                        for (const id of bookingIds) {
                            try {
                                await this.bookingsService.updateStatus(id.trim(), 'cancelled');
                                console.log(`❌ Booking ${id.trim()} ยกเลิก`);
                            }
                            catch (error) {
                                console.error(`❌ Failed to cancel booking ${id}:`, error);
                            }
                        }
                    }
                }
            }
            return { received: true };
        }
        catch (error) {
            console.error('Webhook Error:', error);
            throw error;
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        bookings_service_1.BookingsService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map