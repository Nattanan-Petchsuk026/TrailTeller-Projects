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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const google_genai_1 = require("@langchain/google-genai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
let AiService = class AiService {
    configService;
    model;
    constructor(configService) {
        this.configService = configService;
        this.model = new google_genai_1.ChatGoogleGenerativeAI({
            model: 'gemini-2.0-flash-exp',
            apiKey: this.configService.get('GOOGLE_API_KEY'),
            temperature: 0.7,
            maxOutputTokens: 2048,
        });
    }
    async suggestDestinations(input) {
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            [
                'system',
                `You are TrailTeller, an expert AI travel planner. Your mission is to help travelers find their perfect destination.
        
You should:
- Recommend destinations that match their budget, interests, and travel style
- Consider the best time to visit based on weather and events
- Provide practical tips about costs, activities, and local experiences
- Be enthusiastic but realistic about suggestions
- Always respond in Thai language`,
            ],
            [
                'user',
                `ช่วยแนะนำจุดหมายปลายทางให้หน่อย:

งบประมาณ: {budget} บาท
ความสนใจ: {interests}
สไตล์การเดินทาง: {travelStyle}
ระยะเวลา: {duration} วัน
ฤดูกาลที่ชอบ: {preferredSeason}

กรุณาแนะนำ 3-5 จุดหมายปลายทางที่เหมาะสม พร้อมเหตุผล และคำแนะนำในการเดินทาง`,
            ],
        ]);
        const chain = prompt.pipe(this.model).pipe(new output_parsers_1.StringOutputParser());
        const response = await chain.invoke({
            budget: input.budget.toLocaleString('th-TH'),
            interests: input.interests.join(', '),
            travelStyle: input.travelStyle,
            duration: input.duration,
            preferredSeason: input.preferredSeason || 'ไม่ระบุ',
        });
        return response;
    }
    async generateItinerary(input) {
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            [
                'system',
                `You are TrailTeller's itinerary planner. Create detailed, practical day-by-day travel plans.

Include:
- Daily activities with time suggestions
- Recommended restaurants and local food
- Transportation tips
- Budget breakdown
- Insider tips and cultural notes
- Always respond in Thai language`,
            ],
            [
                'user',
                `สร้างแผนการเดินทางให้หน่อย:

จุดหมาย: {destination}
วันที่เริ่มต้น: {startDate}
วันที่สิ้นสุด: {endDate}
งบประมาณ: {budget} บาท
ความสนใจ: {interests}

กรุณาสร้างแผนการเดินทางแบบวันต่อวัน พร้อมกิจกรรม สถานที่ท่องเที่ยว และค่าใช้จ่ายประมาณการ`,
            ],
        ]);
        const chain = prompt.pipe(this.model).pipe(new output_parsers_1.StringOutputParser());
        const response = await chain.invoke({
            destination: input.destination,
            startDate: input.startDate,
            endDate: input.endDate,
            budget: input.budget.toLocaleString('th-TH'),
            interests: input.interests.join(', '),
        });
        return response;
    }
    async suggestBestTravelTime(destination) {
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            [
                'system',
                `You are a weather and travel timing expert. Analyze the best time to visit destinations considering:
- Weather patterns
- Tourist seasons (peak/off-peak)
- Local festivals and events
- Price variations
- Always respond in Thai language`,
            ],
            [
                'user',
                `ช่วยแนะนำช่วงเวลาที่เหมาะสมในการเดินทางไป {destination}

กรุณาวิเคราะห์:
1. สภาพอากาศในแต่ละช่วง
2. ฤดูกาลท่องเที่ยว (peak/off-peak)
3. เทศกาลหรืองานสำคัญ
4. ข้อดี-ข้อเสียของแต่ละช่วงเวลา`,
            ],
        ]);
        const chain = prompt.pipe(this.model).pipe(new output_parsers_1.StringOutputParser());
        const response = await chain.invoke({ destination });
        return response;
    }
    async chat(message, context) {
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            [
                'system',
                `You are TrailTeller, a friendly and knowledgeable AI travel assistant.
        
Help users with:
- Travel planning and advice
- Destination recommendations
- Budget tips
- Cultural insights
- Booking suggestions

Be conversational, helpful, and always respond in Thai language.

${context ? `Context: ${context}` : ''}`,
            ],
            ['user', '{message}'],
        ]);
        const chain = prompt.pipe(this.model).pipe(new output_parsers_1.StringOutputParser());
        const response = await chain.invoke({ message });
        return response;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map