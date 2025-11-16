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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const auth_guard_1 = require("../auth/guards/auth.guard");
const create_payment_intent_dto_1 = require("./dto/create-payment-intent.dto");
let PaymentController = class PaymentController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createIntent(body) {
        try {
            console.log('📥 Received payment request:', JSON.stringify(body, null, 2));
            const result = await this.paymentService.createPaymentIntent(body.bookingId, body.amount, body.metadata);
            if (!result || !result.chargeId || !result.authorizeUri) {
                throw new Error('Invalid payment response from Omise');
            }
            const response = {
                success: true,
                data: {
                    chargeId: String(result.chargeId),
                    authorizeUri: String(result.authorizeUri),
                },
            };
            console.log('📤 Sending payment response:', JSON.stringify(response, null, 2));
            return response;
        }
        catch (error) {
            console.error('❌ Create Payment Intent Error:', error);
            return {
                success: false,
                message: error.message || 'ไม่สามารถสร้างการชำระเงินได้',
                data: null,
            };
        }
    }
    async webhook(payload, signature) {
        try {
            console.log('🔔 Received webhook:', payload);
            await this.paymentService.handleWebhook(payload);
            return { received: true };
        }
        catch (error) {
            console.error('❌ Webhook Error:', error);
            return { received: false, error: error.message };
        }
    }
    async checkStatus(chargeId) {
        try {
            const status = await this.paymentService.checkPaymentStatus(chargeId);
            return {
                success: true,
                data: status,
            };
        }
        catch (error) {
            console.error('❌ Check Status Error:', error);
            return {
                success: false,
                message: error.message || 'ไม่สามารถตรวจสอบสถานะได้',
                data: null,
            };
        }
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('create-intent'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_intent_dto_1.CreatePaymentIntentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createIntent", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-omise-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "webhook", null);
__decorate([
    (0, common_1.Get)('status/:chargeId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('chargeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "checkStatus", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map