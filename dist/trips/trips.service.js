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
exports.TripsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const trip_entity_1 = require("./entities/trip.entity");
let TripsService = class TripsService {
    tripRepository;
    constructor(tripRepository) {
        this.tripRepository = tripRepository;
    }
    async create(createTripDto) {
        const trip = this.tripRepository.create(createTripDto);
        return await this.tripRepository.save(trip);
    }
    async findAllByUser(userId) {
        return await this.tripRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const trip = await this.tripRepository.findOne({
            where: { id, userId },
        });
        if (!trip) {
            throw new common_1.NotFoundException('ไม่พบทริปนี้');
        }
        return trip;
    }
    async update(id, userId, updateTripDto) {
        const trip = await this.findOne(id, userId);
        Object.assign(trip, updateTripDto);
        return await this.tripRepository.save(trip);
    }
    async remove(id, userId) {
        const trip = await this.findOne(id, userId);
        await this.tripRepository.remove(trip);
    }
    async findByStatus(userId, status) {
        return await this.tripRepository.find({
            where: { userId, status },
            order: { createdAt: 'DESC' },
        });
    }
    async countByUser(userId) {
        return await this.tripRepository.count({
            where: { userId },
        });
    }
    async getStats(userId) {
        const trips = await this.tripRepository.find({
            where: { userId },
        });
        const uniqueCountries = new Set(trips.filter((t) => t.country).map((t) => t.country));
        const completedTrips = trips.filter((t) => t.status === trip_entity_1.TripStatus.COMPLETED).length;
        const upcomingTrips = trips.filter((t) => t.status === trip_entity_1.TripStatus.CONFIRMED ||
            t.status === trip_entity_1.TripStatus.IN_PROGRESS).length;
        const totalBudget = trips.reduce((sum, trip) => sum + Number(trip.budget), 0);
        const destinationCount = trips.reduce((acc, trip) => {
            acc[trip.destination] = (acc[trip.destination] || 0) + 1;
            return acc;
        }, {});
        const favoriteDestinations = Object.entries(destinationCount)
            .map(([destination, count]) => ({ destination, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
        return {
            totalTrips: trips.length,
            countriesVisited: uniqueCountries.size,
            completedTrips,
            upcomingTrips,
            totalBudget,
            favoriteDestinations,
        };
    }
};
exports.TripsService = TripsService;
exports.TripsService = TripsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(trip_entity_1.Trip)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TripsService);
//# sourceMappingURL=trips.service.js.map