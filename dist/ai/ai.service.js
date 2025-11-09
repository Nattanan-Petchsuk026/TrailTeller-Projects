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
const weather_service_1 = require("../weather/weather.service");
let AiService = class AiService {
    configService;
    weatherService;
    model;
    constructor(configService, weatherService) {
        this.configService = configService;
        this.weatherService = weatherService;
        this.model = new google_genai_1.ChatGoogleGenerativeAI({
            model: 'gemini-2.0-flash-exp',
            apiKey: this.configService.get('GOOGLE_API_KEY'),
            temperature: 0.7,
            maxOutputTokens: 2048,
        });
    }
    async suggestDestinations(input) {
        const weatherInfo = await Promise.all([
            this.weatherService.getCurrentWeather('Bangkok'),
            this.weatherService.getCurrentWeather('Chiang Mai'),
            this.weatherService.getCurrentWeather('Phuket'),
            this.weatherService.getCurrentWeather('Tokyo'),
            this.weatherService.getCurrentWeather('Seoul'),
        ]);
        const cities = ['กรุงเทพ', 'เชียงใหม่', 'ภูเก็ต', 'โตเกียว', 'โซล'];
        const weatherContext = weatherInfo
            .map((w, i) => {
            return w
                ? `${cities[i]}: ${w.temp}°C, ${w.description}, ฝน ${w.rainfall}mm`
                : '';
        })
            .filter(Boolean)
            .join(' | ');
        console.log('🌤️  Real-time Weather:', weatherContext);
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            [
                'system',
                `You are TrailTeller AI, an expert travel planner with REAL-TIME WEATHER DATA. Generate EXACTLY 3 destination options based on user preferences.

🌤️ CURRENT WEATHER DATA:
${weatherContext || 'Weather data unavailable'}

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no explanation, no additional text.

Return format:
[
  {{
    "destination": "ชื่อเมือง",
    "country": "ชื่อประเทศ",
    "duration": จำนวนวัน (number),
    "estimatedBudget": งบประมาณโดยประมาณ (number),
    "highlights": ["ไฮไลท์1", "ไฮไลท์2", "ไฮไลท์3"],
    "bestTime": "ช่วงเวลาที่เหมาะสม (พิจารณาจากสภาพอากาศปัจจุบัน)",
    "activities": ["กิจกรรม1", "กิจกรรม2", "กิจกรรม3"],
    "reason": "เหตุผลที่แนะนำ (รวมสภาพอากาศปัจจุบัน)"
  }}
]

Rules:
- Respond in Thai language for all text fields
- Match budget realistically
- Consider travel style: budget (ประหยัด), comfort (สะดวกสบาย), luxury (หรูหรา)
- Duration should match user input
- Suggest diverse destinations (different regions/countries)
- ✅ IMPORTANT: Use real-time weather data to recommend the best destinations
- ✅ Mention current weather conditions in the "reason" field`,
            ],
            [
                'user',
                `งบประมาณ: {budget} บาท
ความสนใจ: {interests}
สไตล์การเดินทาง: {travelStyle}
ระยะเวลา: {duration} วัน
ฤดูกาลที่ชอบ: {preferredSeason}`,
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
        try {
            const cleanResponse = response
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            const options = JSON.parse(cleanResponse);
            return options;
        }
        catch (err) {
            console.error('Failed to parse AI response:', response, err);
            return this.getDefaultOptions(input);
        }
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
        const currentWeather = await this.weatherService.getCurrentWeather(destination);
        const weatherRecommendation = await this.weatherService.getBestTravelTime(destination);
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            [
                'system',
                `You are TrailTeller's travel timing expert with REAL-TIME WEATHER DATA. Suggest the best time to visit destinations based on weather, festivals, crowds, and prices.

🌤️ CURRENT WEATHER:
${currentWeather ? `อุณหภูมิ: ${currentWeather.temp}°C, สภาพ: ${currentWeather.description}, ฝน: ${currentWeather.rainfall}mm` : 'ไม่มีข้อมูล'}

📊 WEATHER FORECAST:
${weatherRecommendation}

Always respond in Thai language with detailed explanations about:
- Best months to visit (consider current weather)
- Weather conditions
- Peak/off-peak seasons
- Special events or festivals
- Budget considerations`,
            ],
            [
                'user',
                `จุดหมายปลายทาง: {destination}

กรุณาแนะนำช่วงเวลาที่ดีที่สุดในการเดินทางไป พร้อมเหตุผล สภาพอากาศ และข้อควรรู้`,
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
    async searchDestinations(query) {
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            [
                'system',
                `You are TrailTeller's destination search expert.

Search for travel destinations based on user queries. Return EXACTLY 5 results in JSON format.

CRITICAL: Respond with ONLY valid JSON array. No markdown, no explanation.

Format (example structure):
[
  {{
    "name": "ชื่อสถานที่",
    "country": "ชื่อประเทศ",
    "description": "คำอธิบายสั้นๆ ไม่เกิน 2 ประโยค",
    "tags": ["tag1", "tag2", "tag3"],
    "bestTime": "ช่วงเวลาที่เหมาะสม",
    "estimatedBudget": 15000,
    "highlights": ["ไฮไลท์1", "ไฮไลท์2", "ไฮไลท์3"],
    "activities": ["กิจกรรม1", "กิจกรรม2", "กิจกรรม3"]
  }}
]

Rules:
- Always respond in Thai language
- Return EXACTLY 5 destinations
- Match the user's search intent
- Include diverse options (different types/locations)
- Be specific and practical
- estimatedBudget must be a number (average per person for 3-4 days)
- Each destination should be unique and interesting`,
            ],
            ['user', 'ค้นหา: {query}'],
        ]);
        const chain = prompt.pipe(this.model).pipe(new output_parsers_1.StringOutputParser());
        const response = await chain.invoke({ query });
        try {
            const cleanResponse = response
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            const results = JSON.parse(cleanResponse);
            console.log('✅ Search results parsed successfully:', results.length, 'destinations');
            return results;
        }
        catch (err) {
            console.error('❌ Failed to parse search results:', err);
            console.error('Response was:', response);
            return [];
        }
    }
    getDefaultOptions(input) {
        const baseOptions = [
            {
                destination: 'เชียงใหม่',
                country: 'ไทย',
                duration: input.duration || 3,
                estimatedBudget: Math.min(input.budget, 15000),
                highlights: ['วัดพระธาตุดอยสุเทพ', 'ตลาดวโรรส', 'ถนนคนเดินนิมมาน'],
                bestTime: 'พฤศจิกายน-กุมภาพันธ์',
                activities: ['เที่ยวชมวัด', 'ช้อปปิ้ง', 'ลิ้มรสอาหารเหนือ'],
                reason: 'เมืองท่องเที่ยวยอดนิยมในไทย บรรยากาศดี อาหารอร่อย',
            },
            {
                destination: 'ภูเก็ต',
                country: 'ไทย',
                duration: input.duration || 4,
                estimatedBudget: Math.min(input.budget, 20000),
                highlights: ['หาดป่าตอง', 'เกาะพีพี', 'โอลด์ทาวน์'],
                bestTime: 'พฤศจิกายน-เมษายน',
                activities: ['ดำน้ำ', 'พักผ่อนริมชายหาด', 'ทานอาหารทะเล'],
                reason: 'ทะเลสวย หาดทรายขาว บรรยากาศสบายๆ',
            },
            {
                destination: 'กรุงเทพฯ',
                country: 'ไทย',
                duration: input.duration || 3,
                estimatedBudget: Math.min(input.budget, 12000),
                highlights: ['วัดพระแก้ว', 'เจ้าพระยา', 'ช้อปปิ้งสยาม'],
                bestTime: 'ตลอดทั้งปี',
                activities: ['ช้อปปิ้ง', 'ชิมอาหาร', 'เที่ยวชมวัฒนธรรม'],
                reason: 'เมืองหลวง มีทุกอย่างครบ เดินทางสะดวก',
            },
        ];
        return baseOptions;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        weather_service_1.WeatherService])
], AiService);
//# sourceMappingURL=ai.service.js.map