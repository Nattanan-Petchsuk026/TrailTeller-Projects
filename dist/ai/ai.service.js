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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const google_genai_1 = require("@langchain/google-genai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const weather_service_1 = require("../weather/weather.service");
const bookings_service_1 = require("../bookings/bookings.service");
let AiService = class AiService {
    configService;
    weatherService;
    bookingsService;
    model;
    constructor(configService, weatherService, bookingsService) {
        this.configService = configService;
        this.weatherService = weatherService;
        this.bookingsService = bookingsService;
        this.model = new google_genai_1.ChatGoogleGenerativeAI({
            model: 'gemini-2.0-flash',
            apiKey: this.configService.get('GOOGLE_API_KEY'),
            temperature: 0.8,
            maxOutputTokens: 4096,
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
        const maxBudget = input.budget;
        const minBudget = Math.floor(input.budget * 0.6);
        const midBudget = Math.floor(input.budget * 0.8);
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            [
                'system',
                `You are TrailTeller AI, an EXPERT travel planner with REAL-TIME WEATHER DATA.

🌤️ CURRENT WEATHER DATA:
${weatherContext || 'Weather data unavailable'}

💰 CRITICAL BUDGET CONSTRAINTS:
- User's TOTAL budget: ${maxBudget.toLocaleString()} THB for ${input.duration} days
- Your recommendations MUST stay within this budget (including flights, hotels, food, activities)
- Suggest 3 DIFFERENT destinations with varying budget allocations:
  * Option 1: Budget-friendly (~${minBudget.toLocaleString()} THB)
  * Option 2: Mid-range (~${midBudget.toLocaleString()} THB)  
  * Option 3: Near maximum budget (~${maxBudget.toLocaleString()} THB)

🎯 DIVERSITY REQUIREMENTS:
- Each destination MUST be COMPLETELY DIFFERENT (different regions/countries)
- NO DUPLICATES - if you suggest "เชียงใหม่", don't suggest it again
- Mix domestic and international destinations based on budget
- Consider travel style: ${input.travelStyle}

YOUR MISSION: Generate EXACTLY 3 COMPLETE destination packages that:
✅ Stay within budget (including ALL costs)
✅ Are geographically diverse
✅ Match user interests: ${input.interests.join(', ')}
✅ Include realistic pricing for hotels, flights, activities

CRITICAL: Respond with ONLY valid JSON. No markdown, no explanation.

Return format:
[
  {{
    "destination": "ชื่อเมือง (ต้องไม่ซ้ำกับตัวเลือกอื่น)",
    "country": "ชื่อประเทศ",
    "duration": ${input.duration},
    "estimatedBudget": จำนวนเงินที่ไม่เกิน ${maxBudget} (number),
    "highlights": ["ไฮไลท์1", "ไฮไลท์2", "ไฮไลท์3"],
    "bestTime": "ช่วงเวลาที่เหมาะสม",
    "activities": ["กิจกรรม1", "กิจกรรม2", "กิจกรรม3"],
    "reason": "เหตุผลที่แนะนำ พร้อมระบุว่าอยู่ในงบประมาณ (1-2 ประโยค)"
  }}
]

RULES:
- ALL text in Thai language
- estimatedBudget MUST NOT exceed ${maxBudget}
- Each destination must be UNIQUE (no duplicates)
- Use REAL-TIME WEATHER data for recommendations
- Travel style "${input.travelStyle}" affects recommendations
- Keep descriptions SHORT and practical`,
            ],
            [
                'user',
                `งบประมาณ: {budget} บาท (สูงสุด)
ความสนใจ: {interests}
สไตล์การเดินทาง: {travelStyle}
ระยะเวลา: {duration} วัน
ฤดูกาลที่ชอบ: {preferredSeason}

กรุณาสร้างแพ็กเกจทริปที่หลากหลาย 3 ตัวเลือก โดยแต่ละตัวเลือกต้อง:
- อยู่ในงบประมาณที่กำหนด
- เป็นสถานที่ที่แตกต่างกัน (ห้ามซ้ำ)
- มีค่าใช้จ่ายรวมที่สมเหตุสมผล`,
            ],
        ]);
        const chain = prompt.pipe(this.model).pipe(new output_parsers_1.StringOutputParser());
        const response = await chain.invoke({
            budget: maxBudget.toLocaleString('th-TH'),
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
            const destinations = options.map(o => o.destination);
            const uniqueDestinations = new Set(destinations);
            if (destinations.length !== uniqueDestinations.size) {
                console.warn('⚠️ AI suggested duplicate destinations, regenerating...');
                return this.getDefaultOptions(input);
            }
            const overBudget = options.filter(o => o.estimatedBudget > maxBudget);
            if (overBudget.length > 0) {
                console.warn('⚠️ Some options exceed budget:', overBudget);
            }
            console.log('✅ AI generated diverse trip packages:', options.length);
            return options;
        }
        catch (err) {
            console.error('Failed to parse AI response:', response, err);
            return this.getDefaultOptions(input);
        }
    }
    async searchAffordableHotels(params) {
        console.log(`🏨 Searching hotels with max ${params.maxBudgetPerNight}/night`);
        const allHotels = await this.bookingsService.searchHotels({
            destination: params.destination,
            checkIn: params.checkIn,
            checkOut: params.checkOut,
            guests: params.guests,
        });
        const affordableHotels = allHotels.filter((hotel) => {
            const totalHotelCost = hotel.price * params.duration;
            return totalHotelCost <= params.maxBudgetPerNight * params.duration * 1.2;
        });
        affordableHotels.sort((a, b) => a.price - b.price);
        console.log(`✅ Found ${affordableHotels.length} affordable hotels`);
        return affordableHotels;
    }
    async searchAffordableFlights(params) {
        console.log(`✈️ Searching flights with max budget ${params.maxBudgetTotal} THB`);
        const allFlights = await this.bookingsService.searchFlights({
            origin: params.origin,
            destination: params.destination,
            departureDate: params.departureDate,
            returnDate: params.returnDate,
            passengers: params.passengers,
            seatClass: params.seatClass,
        });
        const affordableFlights = allFlights.filter((flight) => {
            const totalFlightCost = flight.price * params.passengers;
            return totalFlightCost <= params.maxBudgetTotal;
        });
        affordableFlights.sort((a, b) => a.price - b.price);
        console.log(`✅ Found ${affordableFlights.length} affordable flights`);
        return affordableFlights;
    }
    async searchAffordableRestaurants(params) {
        console.log(`🍽️ Budget left for restaurants: ${params.remainingBudget} THB`);
        const allRestaurants = await this.bookingsService.searchRestaurants({
            destination: params.destination,
            date: params.date,
            partySize: params.partySize,
            cuisine: params.cuisine,
        });
        const getPriceLevel = (priceRange) => {
            const bahtCount = (priceRange.match(/฿/g) || []).length;
            return bahtCount;
        };
        let affordableRestaurants = allRestaurants;
        const budgetPercent = params.remainingBudget / 30000;
        if (budgetPercent < 0.3) {
            affordableRestaurants = allRestaurants.filter((r) => getPriceLevel(r.priceRange) <= 2);
        }
        else if (budgetPercent < 0.5) {
            affordableRestaurants = allRestaurants.filter((r) => getPriceLevel(r.priceRange) <= 3);
        }
        console.log(`✅ Found ${affordableRestaurants.length} suitable restaurants`);
        return affordableRestaurants;
    }
    async generateItinerary(input) {
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            [
                'system',
                `You are TrailTeller's ALL-IN-ONE itinerary planner.

Create COMPLETE day-by-day travel plans including:
✅ Activities with timings
✅ Restaurant recommendations for each meal
✅ Hotel check-in/out info
✅ Transportation tips
✅ Budget breakdown

FORMAT (CRITICAL):
📅 วันที่ X (วัน/เดือน)
━━━━━━━━━━━━━━━

🌅 เช้า (8:00-12:00)
📍 [สถานที่] - [คำอธิบายสั้นๆ]
💰 ค่าใช้จ่าย: XXX บาท

🍽️ มื้อเช้าแนะนำ:
📍 [ร้านอาหาร] - [เมนูเด็ด]
💰 ค่าใช้จ่าย: XXX บาท

🌞 บ่าย (13:00-17:00)
📍 [สถานที่] - [คำอธิบาย]
💰 ค่าใช้จ่าย: XXX บาท

🍽️ มื้อเที่ยงแนะนำ:
📍 [ร้านอาหาร] - [เมนูเด็ด]
💰 ค่าใช้จ่าย: XXX บาท

🌙 เย็น (18:00-21:00)
🍽️ [ร้านอาหาร/กิจกรรม]
💰 ค่าใช้จ่าย: XXX บาท

🏨 ที่พักแนะนำ: [ชื่อโรงแรม] (฿XXX/คืน)

━━━━━━━━━━━━━━━
💵 รวมค่าใช้จ่ายวันนี้: XXX บาท

IMPORTANT:
- Total cost must not exceed budget: ${input.budget} THB
- Include specific restaurant names (realistic)
- Show meal recommendations for breakfast, lunch, dinner
- Add hotel recommendations
- Keep each description to 1 line max
- Use clear time slots
- Show costs for EVERYTHING
- Always respond in Thai language
- MAXIMUM 1000 words total`,
            ],
            [
                'user',
                `สร้างแผนการเดินทางแบบละเอียด:

จุดหมาย: {destination}
วันที่เริ่มต้น: {startDate}
วันที่สิ้นสุด: {endDate}
งบประมาณ: {budget} บาท (สูงสุด)
ความสนใจ: {interests}

กรุณาสร้างแผนการเดินทางแบบวันต่อวัน พร้อมแนะนำโรงแรม ร้านอาหาร กิจกรรม และค่าใช้จ่ายที่ไม่เกินงบประมาณ`,
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
                `You are TrailTeller's travel timing expert with REAL-TIME WEATHER DATA.

🌤️ CURRENT WEATHER:
${currentWeather ? `อุณหภูมิ: ${currentWeather.temp}°C, สภาพ: ${currentWeather.description}, ฝน: ${currentWeather.rainfall}mm` : 'ไม่มีข้อมูล'}

📊 WEATHER FORECAST:
${weatherRecommendation}

FORMAT RULES:
- Use emojis for visual appeal
- Keep sections short and scannable
- Maximum 400 words
- Use bullet points

Always respond in Thai language with:
- Best months to visit (consider current weather)
- Weather conditions
- Peak/off-peak seasons
- Special events or festivals
- Budget considerations`,
            ],
            ['user', `จุดหมายปลายทาง: {destination}`],
        ]);
        const chain = prompt.pipe(this.model).pipe(new output_parsers_1.StringOutputParser());
        const response = await chain.invoke({ destination });
        return response;
    }
    async chat(message, context) {
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            [
                'system',
                `You are TrailTeller, a friendly ALL-IN-ONE AI travel assistant.

PERSONALITY:
- Friendly, helpful, enthusiastic 😊
- Expert in hotels, restaurants, activities
- Keep responses SHORT (2-4 sentences for simple questions)
- Use emojis naturally
- Be practical and actionable

RESPONSE GUIDELINES:
- Simple questions: 2-3 sentences
- Detailed requests: Use bullet points, max 6 points
- Always respond in Thai language
- If you don't know, be honest but helpful

YOU CAN HELP WITH:
✅ Hotel recommendations
✅ Restaurant suggestions
✅ Activity planning
✅ Budget tips
✅ Cultural insights
✅ Travel itineraries

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

Search for destinations and include complete recommendations.

CRITICAL: Respond with ONLY valid JSON array (5 UNIQUE results). No markdown.

Format:
[
  {{
    "name": "ชื่อสถานที่ (ต้องไม่ซ้ำกัน)",
    "country": "ชื่อประเทศ",
    "description": "คำอธิบายสั้นๆ (ไม่เกิน 2 ประโยค)",
    "tags": ["tag1", "tag2", "tag3"],
    "bestTime": "ช่วงเวลาที่เหมาะสม",
    "estimatedBudget": 15000,
    "highlights": ["ไฮไลท์1", "ไฮไลท์2", "ไฮไลท์3"],
    "activities": ["กิจกรรม1", "กิจกรรม2", "กิจกรรม3"],
    
    "topHotels": [
      {{"name": "ชื่อโรงแรม", "type": "budget|mid-range|luxury"}}
    ],
    
    "topRestaurants": [
      {{"name": "ชื่อร้าน", "cuisine": "ประเภทอาหาร"}}
    ]
  }}
]

RULES:
- Always Thai language
- Return EXACTLY 5 UNIQUE destinations (no duplicates)
- Match search intent
- Be specific and practical
- estimatedBudget must be realistic number`,
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
            console.log('✅ Search results:', results.length, 'destinations');
            return results;
        }
        catch (err) {
            console.error('❌ Failed to parse search results:', err);
            return [];
        }
    }
    getDefaultOptions(input) {
        const maxBudget = input.budget;
        return [
            {
                destination: 'เชียงใหม่',
                country: 'ไทย',
                duration: input.duration || 3,
                estimatedBudget: Math.min(maxBudget * 0.6, 15000),
                highlights: ['วัดพระธาทุดอยสุเทพ', 'ตลาดวโรรส', 'ถนนคนเดินนิมมาน'],
                bestTime: 'พฤศจิกายน-กุมภาพันธ์',
                activities: ['เที่ยวชมวัด', 'ช้อปปิ้ง', 'ลิ้มรสอาหารเหนือ'],
                reason: 'เมืองท่องเที่ยวยอดนิยม อากาศดี อาหารอร่อย อยู่ในงบประมาณ',
                recommendedHotels: [
                    { name: 'โรงแรมเชียงใหม่เกท', type: 'budget', estimatedPrice: 800, location: 'ใจกลางเมือง' },
                    { name: 'Akyra Manor', type: 'mid-range', estimatedPrice: 2500, location: 'นิมมาน' },
                ],
            },
            {
                destination: 'กระบี่',
                country: 'ไทย',
                duration: input.duration || 3,
                estimatedBudget: Math.min(maxBudget * 0.8, 25000),
                highlights: ['อ่าวนาง', 'เกาะพีพี', 'ถ้ำพระนาง'],
                bestTime: 'พฤศจิกายน-เมษายน',
                activities: ['ดำน้ำ', 'นั่งเรือ', 'ผ่อนคลายชายหาด'],
                reason: 'ทะเลสวย บรรยากาศเงียบสงบ เหมาะกับงบประมาณระดับกลาง',
            },
            {
                destination: 'เชียงราย',
                country: 'ไทย',
                duration: input.duration || 3,
                estimatedBudget: Math.min(maxBudget, 20000),
                highlights: ['วัดร่องขุ่น', 'สามเหลี่ยมทองคำ', 'บ้านดำ'],
                bestTime: 'พฤศจิกายน-กุมภาพันธ์',
                activities: ['ชมวัด', 'ชิมชา', 'ถ่ายรูป'],
                reason: 'สถานที่ท่องเที่ยวที่แปลกตา อยู่ในงบประมาณ',
            },
        ];
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => bookings_service_1.BookingsService))),
    __metadata("design:paramtypes", [config_1.ConfigService,
        weather_service_1.WeatherService,
        bookings_service_1.BookingsService])
], AiService);
//# sourceMappingURL=ai.service.js.map