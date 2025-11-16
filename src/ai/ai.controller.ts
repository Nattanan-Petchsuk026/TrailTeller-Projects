/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsDefined,
} from 'class-validator';

// ---------------------------------------------------------
// DTO Definitions
// ---------------------------------------------------------

class SuggestDestinationsDto {
  @IsNumber()
  budget: number;

  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @IsString()
  travelStyle: string;

  @IsNumber()
  duration: number;

  @IsOptional()
  @IsString()
  preferredSeason?: string;
}

class GenerateItineraryDto {
  @IsString()
  destination: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsNumber()
  budget: number;

  @IsArray()
  @IsString({ each: true })
  interests: string[];
}

class BestTravelTimeDto {
  @IsString()
  destination: string;
}

class ChatDto {
  @IsDefined()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  context?: string;
}

class SearchDestinationsDto {
  @IsString()
  query: string;
}

// ---------------------------------------------------------
// Controller
// ---------------------------------------------------------

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/suggest-destinations
   */
  @Post('suggest-destinations')
  @HttpCode(HttpStatus.OK)
  async suggestDestinations(@Body() dto: SuggestDestinationsDto) {
    const suggestion = await this.aiService.suggestDestinations(dto);
    return {
      success: true,
      data: { suggestion, input: dto },
    };
  }

  /**
   * POST /ai/generate-itinerary
   */
  @Post('generate-itinerary')
  @HttpCode(HttpStatus.OK)
  async generateItinerary(@Body() dto: GenerateItineraryDto) {
    const itinerary = await this.aiService.generateItinerary(dto);
    return {
      success: true,
      data: { itinerary, input: dto },
    };
  }

  /**
   * POST /ai/best-travel-time
   */
  @Post('best-travel-time')
  @HttpCode(HttpStatus.OK)
  async bestTravelTime(@Body() dto: BestTravelTimeDto) {
    const recommendation = await this.aiService.suggestBestTravelTime(
      dto.destination,
    );
    return {
      success: true,
      data: {
        recommendation,
        destination: dto.destination,
      },
    };
  }

  /**
   * POST /ai/chat
   */
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatDto) {
    console.log('✅ Received chat payload:', dto);
    const response = await this.aiService.chat(dto.message, dto.context);
    return {
      success: true,
      data: { response, message: dto.message },
    };
  }

  /**
   * POST /ai/search-destinations
   */
  @Post('search-destinations')
  @HttpCode(HttpStatus.OK)
  async searchDestinations(@Body() dto: SearchDestinationsDto) {
    console.log('🔍 Searching for:', dto.query);
    const results = await this.aiService.searchDestinations(dto.query);
    return {
      success: true,
      data: { results, query: dto.query },
    };
  }

  // ---------------------------------------------------------------------
  // ⭐ NEW: Affordable Hotels Search
  // ---------------------------------------------------------------------
  @Post('search-affordable-hotels')
  @HttpCode(HttpStatus.OK)
  async searchAffordableHotels(
    @Body()
    dto: {
      destination: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      maxBudgetPerNight: number;
      duration: number;
    },
  ) {
    const hotels = await this.aiService.searchAffordableHotels(dto);
    return { success: true, data: hotels };
  }

  // ---------------------------------------------------------------------
  // ⭐ NEW: Affordable Flights Search
  // ---------------------------------------------------------------------
  @Post('search-affordable-flights')
  @HttpCode(HttpStatus.OK)
  async searchAffordableFlights(
    @Body()
    dto: {
      origin: string;
      destination: string;
      departureDate: string;
      returnDate: string;
      passengers: number;
      maxBudgetTotal: number;
      seatClass?: string;
    },
  ) {
    const flights = await this.aiService.searchAffordableFlights(dto);
    return { success: true, data: flights };
  }

  // ---------------------------------------------------------------------
  // ⭐ NEW: Affordable Restaurants Search
  // ---------------------------------------------------------------------
  @Post('search-affordable-restaurants')
  @HttpCode(HttpStatus.OK)
  async searchAffordableRestaurants(
    @Body()
    dto: {
      destination: string;
      date: string;
      partySize: number;
      remainingBudget: number;
      cuisine?: string;
    },
  ) {
    const restaurants = await this.aiService.searchAffordableRestaurants(dto);
    return { success: true, data: restaurants };
  }
}
