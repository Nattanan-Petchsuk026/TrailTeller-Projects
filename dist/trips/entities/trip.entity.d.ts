import { User } from '../../users/entities/user.entity';
export declare enum TripStatus {
    PLANNING = "planning",
    CONFIRMED = "confirmed",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Trip {
    id: string;
    userId: string;
    destination: string;
    country: string;
    startDate: Date;
    endDate: Date;
    budget: number;
    status: TripStatus;
    itinerary: {
        day: number;
        activities: string[];
        places: string[];
        notes?: string;
    }[];
    notes: string;
    aiSuggestions: {
        bestTime: string;
        weather: string;
        recommendations: string[];
        estimatedCost: number;
    };
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
