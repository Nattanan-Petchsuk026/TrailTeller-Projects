import { ConfigService } from '@nestjs/config';
import { WeatherService } from '../weather/weather.service';
import { BookingsService } from '../bookings/bookings.service';
export interface TripOption {
    destination: string;
    country: string;
    duration: number;
    estimatedBudget: number;
    highlights: string[];
    bestTime: string;
    activities: string[];
    reason: string;
    recommendedHotels?: {
        name: string;
        type: string;
        estimatedPrice: number;
        location: string;
    }[];
    recommendedRestaurants?: {
        name: string;
        cuisine: string;
        specialty: string;
        priceRange: string;
    }[];
    recommendedActivities?: {
        name: string;
        type: string;
        duration: string;
        cost: string;
    }[];
    dayByDayPlan?: {
        day: number;
        morning: string;
        afternoon: string;
        evening: string;
    }[];
}
interface SuggestDestinationsInput {
    budget: number;
    interests: string[];
    travelStyle: string;
    duration: number;
    preferredSeason?: string;
}
export declare class AiService {
    private configService;
    private weatherService;
    private bookingsService;
    private model;
    constructor(configService: ConfigService, weatherService: WeatherService, bookingsService: BookingsService);
    suggestDestinations(input: SuggestDestinationsInput): Promise<TripOption[]>;
    searchAffordableHotels(params: {
        destination: string;
        checkIn: string;
        checkOut: string;
        guests: number;
        maxBudgetPerNight: number;
        duration: number;
    }): Promise<any[]>;
    searchAffordableFlights(params: {
        origin: string;
        destination: string;
        departureDate: string;
        returnDate: string;
        passengers: number;
        maxBudgetTotal: number;
        seatClass?: string;
    }): Promise<any[]>;
    searchAffordableRestaurants(params: {
        destination: string;
        date: string;
        partySize: number;
        remainingBudget: number;
        cuisine?: string;
    }): Promise<any[]>;
    generateItinerary(input: {
        destination: string;
        startDate: string;
        endDate: string;
        budget: number;
        interests: string[];
    }): Promise<string>;
    suggestBestTravelTime(destination: string): Promise<string>;
    chat(message: string, context?: string): Promise<string>;
    searchDestinations(query: string): Promise<any[]>;
    private getDefaultOptions;
}
export {};
