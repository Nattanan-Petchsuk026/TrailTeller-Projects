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
declare class SearchDestinationsDto {
    query: string;
}
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    suggestDestinations(dto: SuggestDestinationsDto): Promise<{
        success: boolean;
        data: {
            suggestion: import("./ai.service").TripOption[];
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
    searchDestinations(dto: SearchDestinationsDto): Promise<{
        success: boolean;
        data: {
            results: any[];
            query: string;
        };
    }>;
    searchAffordableHotels(dto: {
        destination: string;
        checkIn: string;
        checkOut: string;
        guests: number;
        maxBudgetPerNight: number;
        duration: number;
    }): Promise<{
        success: boolean;
        data: any[];
    }>;
    searchAffordableFlights(dto: {
        origin: string;
        destination: string;
        departureDate: string;
        returnDate: string;
        passengers: number;
        maxBudgetTotal: number;
        seatClass?: string;
    }): Promise<{
        success: boolean;
        data: any[];
    }>;
    searchAffordableRestaurants(dto: {
        destination: string;
        date: string;
        partySize: number;
        remainingBudget: number;
        cuisine?: string;
    }): Promise<{
        success: boolean;
        data: any[];
    }>;
}
export {};
