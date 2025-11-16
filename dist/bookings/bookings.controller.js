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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const bookings_service_1 = require("./bookings.service");
const auth_guard_1 = require("../auth/guards/auth.guard");
const booking_entity_1 = require("./entities/booking.entity");
let BookingsController = class BookingsController {
    bookingsService;
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    async create(createBookingDto) {
        const booking = await this.bookingsService.create(createBookingDto);
        return {
            success: true,
            message: 'จองสำเร็จ',
            data: booking,
        };
    }
    async findAllByTrip(tripId) {
        const bookings = await this.bookingsService.findAllByTrip(tripId);
        return { success: true, data: bookings };
    }
    async findByType(tripId, type) {
        const bookings = await this.bookingsService.findByType(tripId, type);
        return { success: true, data: bookings };
    }
    async getTotalCost(tripId) {
        const total = await this.bookingsService.getTotalCost(tripId);
        return { success: true, data: { total } };
    }
    async getSummary(tripId) {
        const summary = await this.bookingsService.getSummaryByType(tripId);
        return { success: true, data: summary };
    }
    async searchHotels(destination, checkIn, checkOut, guests) {
        const hotels = await this.bookingsService.searchHotels({
            destination,
            checkIn,
            checkOut,
            guests: guests || 2,
        });
        return { success: true, data: hotels };
    }
    async searchRestaurants(destination, date, partySize, cuisine) {
        const restaurants = await this.bookingsService.searchRestaurants({
            destination,
            date,
            partySize: partySize || 2,
            cuisine,
        });
        return { success: true, data: restaurants };
    }
    async searchFlights(origin, destination, departureDate, returnDate, passengers, seatClass) {
        const flights = await this.bookingsService.searchFlights({
            origin,
            destination,
            departureDate,
            returnDate,
            passengers: passengers || 1,
            seatClass,
        });
        return { success: true, data: flights };
    }
    async findOne(id) {
        const booking = await this.bookingsService.findOne(id);
        return { success: true, data: booking };
    }
    async update(id, updateBookingDto) {
        const booking = await this.bookingsService.update(id, updateBookingDto);
        return { success: true, message: 'อัปเดตสำเร็จ', data: booking };
    }
    async remove(id) {
        await this.bookingsService.remove(id);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('trip/:tripId'),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findAllByTrip", null);
__decorate([
    (0, common_1.Get)('trip/:tripId/type/:type'),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findByType", null);
__decorate([
    (0, common_1.Get)('trip/:tripId/total'),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getTotalCost", null);
__decorate([
    (0, common_1.Get)('trip/:tripId/summary'),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('search/hotels'),
    __param(0, (0, common_1.Query)('destination')),
    __param(1, (0, common_1.Query)('checkIn')),
    __param(2, (0, common_1.Query)('checkOut')),
    __param(3, (0, common_1.Query)('guests')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "searchHotels", null);
__decorate([
    (0, common_1.Get)('search/restaurants'),
    __param(0, (0, common_1.Query)('destination')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('partySize')),
    __param(3, (0, common_1.Query)('cuisine')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "searchRestaurants", null);
__decorate([
    (0, common_1.Get)('search/flights'),
    __param(0, (0, common_1.Query)('origin')),
    __param(1, (0, common_1.Query)('destination')),
    __param(2, (0, common_1.Query)('departureDate')),
    __param(3, (0, common_1.Query)('returnDate')),
    __param(4, (0, common_1.Query)('passengers')),
    __param(5, (0, common_1.Query)('seatClass')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "searchFlights", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "remove", null);
exports.BookingsController = BookingsController = __decorate([
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map