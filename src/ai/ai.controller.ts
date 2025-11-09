import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsDefined,
} from 'class-validator';

// DTOs for request validation
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
   * POST /ai/search-destinations (✅ ฟังก์ชันใหม่)
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
}
