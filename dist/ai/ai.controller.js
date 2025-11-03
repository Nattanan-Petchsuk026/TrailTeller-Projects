"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
class SuggestDestinationsDto {
    budget;
    interests;
    travelStyle;
    duration;
    preferredSeason;
}
class GenerateItineraryDto {
    destination;
    startDate;
    endDate;
    budget;
    interests;
}
class BestTravelTimeDto {
    destination;
}
class ChatDto {
    message;
    context;
}
let AiController = class AiController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async suggestDestinations(dto) {
        const suggestion = await this.aiService.suggestDestinations(dto);
        return {
            success: true,
            data: {
                suggestion,
                input: dto,
            },
        };
    }
    async generateItinerary(dto) {
        const itinerary = await this.aiService.generateItinerary(dto);
        return {
            success: true,
            data: {
                itinerary,
                input: dto,
            },
        };
    }
    async bestTravelTime(dto) {
        const recommendation = await this.aiService.suggestBestTravelTime(dto.destination);
        return {
            success: true,
            data: {
                recommendation,
                destination: dto.destination,
            },
        };
    }
    async chat(dto) {
        const response = await this.aiService.chat(dto.message, dto.context);
        return {
            success: true,
            data: {
                response,
                message: dto.message,
            },
        };
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('suggest-destinations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SuggestDestinationsDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "suggestDestinations", null);
__decorate([
    (0, common_1.Post)('generate-itinerary'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateItineraryDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateItinerary", null);
__decorate([
    (0, common_1.Post)('best-travel-time'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BestTravelTimeDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "bestTravelTime", null);
__decorate([
    (0, common_1.Post)('chat'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ChatDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chat", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map