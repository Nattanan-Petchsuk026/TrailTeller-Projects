/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { WeatherService } from '../weather/weather.service';

// ✅ Interface ใหม่ - รองรับข้อมูลครบวงจร
export interface TripOption {
  destination: string;
  country: string;
  duration: number;
  estimatedBudget: number;
  highlights: string[];
  bestTime: string;
  activities: string[];
  reason: string;

  // ✅ เพิ่มข้อมูลใหม่
  recommendedHotels?: {
    name: string;
    type: string; // budget, mid-range, luxury
    estimatedPrice: number;
    location: string;
  }[];

  recommendedRestaurants?: {
    name: string;
    cuisine: string;
    specialty: string;
    priceRange: string;
  }[];

  recommendedActivities?: {
    name: string;
    type: string;
    duration: string;
    cost: string;
  }[];

  dayByDayPlan?: {
    day: number;
    morning: string;
    afternoon: string;
    evening: string;
  }[];
}

interface SuggestDestinationsInput {
  budget: number;
  interests: string[];
  travelStyle: string;
  duration: number;
  preferredSeason?: string;
}

@Injectable()
export class AiService {
  private model: ChatGoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private weatherService: WeatherService,
  ) {
    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      apiKey: this.configService.get<string>('GOOGLE_API_KEY'),
      temperature: 0.7,
      maxOutputTokens: 4096, // ✅ เพิ่มเป็น 4096 เพราะต้องการข้อมูลเยอะขึ้น
    });
  }

  /**
   * ✅ แนะนำจุดหมายปลายทาง (3 ตัวเลือก) - แบบครบวงจร
   */
  async suggestDestinations(
    input: SuggestDestinationsInput,
  ): Promise<TripOption[]> {
    // ดึงข้อมูลสภาพอากาศ
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

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are TrailTeller AI, an EXPERT ALL-IN-ONE travel planner with REAL-TIME WEATHER DATA.

🌤️ CURRENT WEATHER DATA:
${weatherContext || 'Weather data unavailable'}

YOUR MISSION: Generate EXACTLY 3 COMPLETE destination packages. Each package must include:
✅ Destination info
✅ Hotel recommendations (3 options: budget/mid-range/luxury)
✅ Restaurant recommendations (3 must-try places)
✅ Activity recommendations (5 things to do)
✅ Day-by-day itinerary plan

CRITICAL: Respond with ONLY valid JSON. No markdown, no explanation.

Return format:
[
  {{
    "destination": "ชื่อเมือง",
    "country": "ชื่อประเทศ",
    "duration": จำนวนวัน (number),
    "estimatedBudget": งบประมาณโดยประมาณ (number),
    "highlights": ["ไฮไลท์1", "ไฮไลท์2", "ไฮไลท์3"],
    "bestTime": "ช่วงเวลาที่เหมาะสม",
    "activities": ["กิจกรรม1", "กิจกรรม2", "กิจกรรม3"],
    "reason": "เหตุผลที่แนะนำ (1-2 ประโยค)",
    
    "recommendedHotels": [
      {{
        "name": "ชื่อโรงแรม",
        "type": "budget|mid-range|luxury",
        "estimatedPrice": ราคาโดยประมาณต่อคืน (number),
        "location": "ทำเล"
      }}
    ],
    
    "recommendedRestaurants": [
      {{
        "name": "ชื่อร้าน",
        "cuisine": "ประเภทอาหาร",
        "specialty": "เมนูเด็ด",
        "priceRange": "฿฿-฿฿฿"
      }}
    ],
    
    "recommendedActivities": [
      {{
        "name": "ชื่อกิจกรรม",
        "type": "adventure|culture|relax|food",
        "duration": "ระยะเวลา",
        "cost": "ค่าใช้จ่าย"
      }}
    ],
    
    "dayByDayPlan": [
      {{
        "day": 1,
        "morning": "กิจกรรมช่วงเช้า",
        "afternoon": "กิจกรรมช่วงบ่าย",
        "evening": "กิจกรรมช่วงเย็น"
      }}
    ]
  }}
]

RULES:
- ALL text in Thai language
- Match budget & travel style realistically
- Duration must match user input
- Suggest DIVERSE destinations (different regions/countries)
- Use REAL-TIME WEATHER data for recommendations
- Hotels: ALWAYS include 3 options (budget, mid-range, luxury)
- Restaurants: 3 must-try places with realistic names
- Activities: 5 varied activities matching interests
- Day-by-day plan: Create realistic daily itinerary
- Keep descriptions SHORT and practical
- All prices must be realistic numbers`,
      ],
      [
        'user',
        `งบประมาณ: {budget} บาท
ความสนใจ: {interests}
สไตล์การเดินทาง: {travelStyle}
ระยะเวลา: {duration} วัน
ฤดูกาลที่ชอบ: {preferredSeason}

กรุณาสร้างแพ็กเกจทริปที่สมบูรณ์ 3 ตัวเลือก พร้อมโรงแรม ร้านอาหาร กิจกรรม และแผนการเดินทางรายวัน`,
      ],
    ]);

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

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

      const options = JSON.parse(cleanResponse) as TripOption[];
      console.log('✅ AI generated complete trip packages:', options.length);
      return options;
    } catch (err) {
      console.error('Failed to parse AI response:', response, err);
      return this.getDefaultOptions(input);
    }
  }

  /**
   * ✅ สร้างแผนการเดินทาง (Itinerary) แบบละเอียดพร้อมโรงแรม+ร้านอาหาร
   */
  async generateItinerary(input: {
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    interests: string[];
  }): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
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
งบประมาณ: {budget} บาท
ความสนใจ: {interests}

กรุณาสร้างแผนการเดินทางแบบวันต่อวัน พร้อมแนะนำโรงแรม ร้านอาหาร กิจกรรม และค่าใช้จ่ายทุกอย่าง`,
      ],
    ]);

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

    const response = await chain.invoke({
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      budget: input.budget.toLocaleString('th-TH'),
      interests: input.interests.join(', '),
    });

    return response;
  }

  /**
   * ✅ แนะนำช่วงเวลาที่ดีที่สุด (ใช้ข้อมูลสภาพอากาศจริง)
   */
  async suggestBestTravelTime(destination: string): Promise<string> {
    const currentWeather =
      await this.weatherService.getCurrentWeather(destination);
    const weatherRecommendation =
      await this.weatherService.getBestTravelTime(destination);

    const prompt = ChatPromptTemplate.fromMessages([
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

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());
    const response = await chain.invoke({ destination });
    return response;
  }

  /**
   * ✅ Chat กับ AI (รองรับคำถามเกี่ยวกับโรงแรม ร้านอาหาร กิจกรรม)
   */
  async chat(message: string, context?: string): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
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

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());
    const response = await chain.invoke({ message });
    return response;
  }

  /**
   * ✅ ค้นหาสถานที่ท่องเที่ยว (พร้อมโรงแรม+ร้านอาหารแนะนำ)
   */
  async searchDestinations(query: string): Promise<any[]> {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are TrailTeller's destination search expert.

Search for destinations and include complete recommendations:
- Top attractions
- 2-3 hotel options (various price ranges)
- 2-3 restaurant recommendations
- Must-do activities

CRITICAL: Respond with ONLY valid JSON array (5 results). No markdown.

Format:
[
  {{
    "name": "ชื่อสถานที่",
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
- Return EXACTLY 5 destinations
- Match search intent
- Be specific and practical
- estimatedBudget must be realistic number`,
      ],
      ['user', 'ค้นหา: {query}'],
    ]);

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());
    const response = await chain.invoke({ query });

    try {
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const results = JSON.parse(cleanResponse);
      console.log('✅ Search results:', results.length, 'destinations');
      return results;
    } catch (err) {
      console.error('❌ Failed to parse search results:', err);
      return [];
    }
  }

  /**
   * Default options (fallback)
   */
  private getDefaultOptions(input: SuggestDestinationsInput): TripOption[] {
    return [
      {
        destination: 'เชียงใหม่',
        country: 'ไทย',
        duration: input.duration || 3,
        estimatedBudget: Math.min(input.budget, 15000),
        highlights: ['วัดพระธาทุดอยสุเทพ', 'ตลาดวโรรส', 'ถนนคนเดินนิมมาน'],
        bestTime: 'พฤศจิกายน-กุมภาพันธ์',
        activities: ['เที่ยวชมวัด', 'ช้อปปิ้ง', 'ลิ้มรสอาหารเหนือ'],
        reason: 'เมืองท่องเที่ยวยอดนิยม อากาศดี อาหารอร่อย',
        recommendedHotels: [
          // eslint-disable-next-line prettier/prettier
          { name: 'โรงแรมเชียงใหม่เกท', type: 'budget', estimatedPrice: 800, location: 'ใจกลางเมือง' },
          // eslint-disable-next-line prettier/prettier
          { name: 'Akyra Manor Chiang Mai', type: 'mid-range', estimatedPrice: 2500, location: 'นิมมาน' },
          // eslint-disable-next-line prettier/prettier
          { name: 'Dhara Dhevi', type: 'luxury', estimatedPrice: 8000, location: 'แม่ริม' },
        ],
        recommendedRestaurants: [
          // eslint-disable-next-line prettier/prettier
          { name: 'ข้าวซอยลำดวน', cuisine: 'อาหารเหนือ', specialty: 'ข้าวซอย', priceRange: '฿' },
          // eslint-disable-next-line prettier/prettier
          { name: 'SP Chicken', cuisine: 'อาหารไทย', specialty: 'ไก่ย่าง', priceRange: '฿' },
          // eslint-disable-next-line prettier/prettier
          { name: 'The Service 1921', cuisine: 'Fine Dining', specialty: 'อาหารฝรั่งเศส', priceRange: '฿฿฿' },
        ],
        recommendedActivities: [
          // eslint-disable-next-line prettier/prettier
          { name: 'วัดพระธาทุดอยสุเทพ', type: 'culture', duration: '3 ชม.', cost: '50 บาท' },
          { name: 'ตลาดวโรรส', type: 'food', duration: '2 ชม.', cost: 'ฟรี' },
          // eslint-disable-next-line prettier/prettier
          { name: 'ถนนคนเดินนิมมาน', type: 'relax', duration: '2-3 ชม.', cost: 'ฟรี' },
        ],
      },
    ];
  }
}
