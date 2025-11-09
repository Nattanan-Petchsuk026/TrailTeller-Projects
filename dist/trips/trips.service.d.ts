import { Repository } from 'typeorm';
import { Trip, TripStatus } from './entities/trip.entity';
export interface CreateTripDto {
    userId: string;
    destination: string;
    country?: string;
    startDate: string;
    endDate: string;
    budget: number;
    itinerary?: any;
    notes?: string;
    aiSuggestions?: any;
}
export interface UpdateTripDto {
    destination?: string;
    country?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    status?: TripStatus;
    itinerary?: any;
    notes?: string;
    aiSuggestions?: any;
}
export declare class TripsService {
    private tripRepository;
    constructor(tripRepository: Repository<Trip>);
    create(createTripDto: CreateTripDto): Promise<Trip>;
    findAllByUser(userId: string): Promise<Trip[]>;
    findOne(id: string, userId: string): Promise<Trip>;
    update(id: string, userId: string, updateTripDto: UpdateTripDto): Promise<Trip>;
    remove(id: string, userId: string): Promise<void>;
    findByStatus(userId: string, status: TripStatus): Promise<Trip[]>;
    countByUser(userId: string): Promise<number>;
    getStats(userId: string): Promise<{
        totalTrips: number;
        countriesVisited: number;
        completedTrips: number;
        upcomingTrips: number;
        totalBudget: number;
        favoriteDestinations: {
            destination: string;
            count: number;
        }[];
    }>;
}
