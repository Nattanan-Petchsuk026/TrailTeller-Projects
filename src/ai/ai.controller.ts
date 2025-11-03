import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';

// DTOs for request validation
class SuggestDestinationsDto {
  budget: number;
  interests: string[];
  travelStyle: string;
  duration: number;
  preferredSeason?: string;
}

class GenerateItineraryDto {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  interests: string[];
}

class BestTravelTimeDto {
  destination: string;
}

class ChatDto {
  message: string;
  context?: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/suggest-destinations
   * แนะนำจุดหมายปลายทาง
   */
  @Post('suggest-destinations')
  @HttpCode(HttpStatus.OK)
  async suggestDestinations(@Body() dto: SuggestDestinationsDto) {
    const suggestion = await this.aiService.suggestDestinations(dto);

    return {
      success: true,
      data: {
        suggestion,
        input: dto,
      },
    };
  }

  /**
   * POST /ai/generate-itinerary
   * สร้างแผนการเดินทาง
   */
  @Post('generate-itinerary')
  @HttpCode(HttpStatus.OK)
  async generateItinerary(@Body() dto: GenerateItineraryDto) {
    const itinerary = await this.aiService.generateItinerary(dto);

    return {
      success: true,
      data: {
        itinerary,
        input: dto,
      },
    };
  }

  /**
   * POST /ai/best-travel-time
   * แนะนำช่วงเวลาที่เหมาะสม
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
   * Chat กับ AI Assistant
   */
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatDto) {
    const response = await this.aiService.chat(dto.message, dto.context);

    return {
      success: true,
      data: {
        response,
        message: dto.message,
      },
    };
  }
}
