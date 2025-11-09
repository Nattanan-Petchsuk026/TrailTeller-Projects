import { TripsService } from './trips.service';
import type { CreateTripDto, UpdateTripDto } from './trips.service';
import type { RequestWithUser } from '../types/request-with-user.interface';
import type { TripStatus } from './entities/trip.entity';
export declare class TripsController {
    private readonly tripsService;
    constructor(tripsService: TripsService);
    create(createTripDto: CreateTripDto, req: RequestWithUser): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/trip.entity").Trip;
    }>;
    findAll(req: RequestWithUser): Promise<{
        success: boolean;
        data: import("./entities/trip.entity").Trip[];
    }>;
    count(req: RequestWithUser): Promise<{
        success: boolean;
        data: {
            count: number;
        };
    }>;
    getStats(req: RequestWithUser): Promise<{
        success: boolean;
        data: {
            totalTrips: number;
            countriesVisited: number;
            completedTrips: number;
            upcomingTrips: number;
            totalBudget: number;
            favoriteDestinations: {
                destination: string;
                count: number;
            }[];
        };
    }>;
    findByStatus(status: TripStatus, req: RequestWithUser): Promise<{
        success: boolean;
        data: import("./entities/trip.entity").Trip[];
    }>;
    findOne(id: string, req: RequestWithUser): Promise<{
        success: boolean;
        data: import("./entities/trip.entity").Trip;
    }>;
    update(id: string, updateTripDto: UpdateTripDto, req: RequestWithUser): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/trip.entity").Trip;
    }>;
    remove(id: string, req: RequestWithUser): Promise<void>;
}
