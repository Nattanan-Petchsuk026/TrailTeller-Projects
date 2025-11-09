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
const class_validator_1 = require("class-validator");
class SuggestDestinationsDto {
    budget;
    interests;
    travelStyle;
    duration;
    preferredSeason;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SuggestDestinationsDto.prototype, "budget", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SuggestDestinationsDto.prototype, "interests", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuggestDestinationsDto.prototype, "travelStyle", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SuggestDestinationsDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuggestDestinationsDto.prototype, "preferredSeason", void 0);
class GenerateItineraryDto {
    destination;
    startDate;
    endDate;
    budget;
    interests;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateItineraryDto.prototype, "destination", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateItineraryDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateItineraryDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GenerateItineraryDto.prototype, "budget", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateItineraryDto.prototype, "interests", void 0);
class BestTravelTimeDto {
    destination;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BestTravelTimeDto.prototype, "destination", void 0);
class ChatDto {
    message;
    context;
}
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatDto.prototype, "context", void 0);
class SearchDestinationsDto {
    query;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchDestinationsDto.prototype, "query", void 0);
let AiController = class AiController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async suggestDestinations(dto) {
        const suggestion = await this.aiService.suggestDestinations(dto);
        return {
            success: true,
            data: { suggestion, input: dto },
        };
    }
    async generateItinerary(dto) {
        const itinerary = await this.aiService.generateItinerary(dto);
        return {
            success: true,
            data: { itinerary, input: dto },
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
        console.log('✅ Received chat payload:', dto);
        const response = await this.aiService.chat(dto.message, dto.context);
        return {
            success: true,
            data: { response, message: dto.message },
        };
    }
    async searchDestinations(dto) {
        console.log('🔍 Searching for:', dto.query);
        const results = await this.aiService.searchDestinations(dto.query);
        return {
            success: true,
            data: { results, query: dto.query },
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
__decorate([
    (0, common_1.Post)('search-destinations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SearchDestinationsDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "searchDestinations", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map