import { AiService } from './ai.service';
declare class SuggestDestinationsDto {
    budget: number;
    interests: string[];
    travelStyle: string;
    duration: number;
    preferredSeason?: string;
}
declare class GenerateItineraryDto {
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    interests: string[];
}
declare class BestTravelTimeDto {
    destination: string;
}
declare class ChatDto {
    message: string;
    context?: string;
}
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    suggestDestinations(dto: SuggestDestinationsDto): Promise<{
        success: boolean;
        data: {
            suggestion: string;
            input: SuggestDestinationsDto;
        };
    }>;
    generateItinerary(dto: GenerateItineraryDto): Promise<{
        success: boolean;
        data: {
            itinerary: string;
            input: GenerateItineraryDto;
        };
    }>;
    bestTravelTime(dto: BestTravelTimeDto): Promise<{
        success: boolean;
        data: {
            recommendation: string;
            destination: string;
        };
    }>;
    chat(dto: ChatDto): Promise<{
        success: boolean;
        data: {
            response: string;
            message: string;
        };
    }>;
}
export {};
