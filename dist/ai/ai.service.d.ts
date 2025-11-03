import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private configService;
    private model;
    constructor(configService: ConfigService);
    suggestDestinations(input: {
        budget: number;
        interests: string[];
        travelStyle: string;
        duration: number;
        preferredSeason?: string;
    }): Promise<string>;
    generateItinerary(input: {
        destination: string;
        startDate: string;
        endDate: string;
        budget: number;
        interests: string[];
    }): Promise<string>;
    suggestBestTravelTime(destination: string): Promise<string>;
    chat(message: string, context?: string): Promise<string>;
}
