import { ConfigService } from '@nestjs/config';
import { WeatherService } from '../weather/weather.service';
export interface TripOption {
    destination: string;
    country: string;
    duration: number;
    estimatedBudget: number;
    highlights: string[];
    bestTime: string;
    activities: string[];
    reason: string;
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
    private model;
    constructor(configService: ConfigService, weatherService: WeatherService);
    suggestDestinations(input: SuggestDestinationsInput): Promise<TripOption[]>;
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
