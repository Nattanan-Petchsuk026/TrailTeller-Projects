/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { WeatherService } from '../weather/weather.service';
import { BookingsService } from '../bookings/bookings.service';

export interface TripOption {
  destination: string;
  country: string;
  duration: number;
  estimatedBudget: number;
  highlights: string[];
  bestTime: string;
  activities: string[];
  reason: string;
  recommendedHotels?: {
    name: string;
    type: string;
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
    @Inject(forwardRef(() => BookingsService))
    private bookingsService: BookingsService,
  ) {
    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      apiKey: this.configService.get<string>('GOOGLE_API_KEY'),
      temperature: 0.8,
      maxOutputTokens: 4096,
    });
  }

  /**
   * ✅ แนะนำจุดหมายปลายทาง พร้อมเช็ค API จริง
   */
  async suggestDestinations(
    input: SuggestDestinationsInput,
  ): Promise<TripOption[]> {
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

    const prompt = ChatPromptTemplate.fromMessages([
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

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

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

      const options = JSON.parse(cleanResponse) as TripOption[];
      
      // ตรวจสอบว่าไม่มีจุดหมายซ้ำ
      const destinations = options.map(o => o.destination);
      const uniqueDestinations = new Set(destinations);
      if (destinations.length !== uniqueDestinations.size) {
        console.warn('⚠️ AI suggested duplicate destinations, regenerating...');
        return this.getDefaultOptions(input);
      }

      // ตรวจสอบงบประมาณ
      const overBudget = options.filter(o => o.estimatedBudget > maxBudget);
      if (overBudget.length > 0) {
        console.warn('⚠️ Some options exceed budget:', overBudget);
      }

      console.log('✅ AI generated diverse trip packages:', options.length);
      return options;
    } catch (err) {
      console.error('Failed to parse AI response:', response, err);
      return this.getDefaultOptions(input);
    }
  }

  /**
   * ✅ ค้นหาโรงแรมที่อยู่ในงบประมาณ
   */
  async searchAffordableHotels(params: {
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    maxBudgetPerNight: number;
    duration: number;
  }) {
    console.log(`🏨 Searching hotels with max ${params.maxBudgetPerNight}/night`);
    
    const allHotels = await this.bookingsService.searchHotels({
      destination: params.destination,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guests: params.guests,
    });

    // กรองโรงแรมที่อยู่ในงบ (คำนวณรวมทั้งหมด)
    const affordableHotels = allHotels.filter((hotel: any) => {
      const totalHotelCost = hotel.price * params.duration;
      return totalHotelCost <= params.maxBudgetPerNight * params.duration * 1.2; // เผื่อ 20%
    });

    // เรียงตามราคา (ถูก -> แพง)
    affordableHotels.sort((a: any, b: any) => a.price - b.price);

    console.log(`✅ Found ${affordableHotels.length} affordable hotels`);
    return affordableHotels;
  }

  /**
   * ✅ ค้นหาเที่ยวบินที่อยู่ในงบประมาณ
   */
  async searchAffordableFlights(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    passengers: number;
    maxBudgetTotal: number;
    seatClass?: string;
  }) {
    console.log(`✈️ Searching flights with max budget ${params.maxBudgetTotal} THB`);
    
    const allFlights = await this.bookingsService.searchFlights({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      passengers: params.passengers,
      seatClass: params.seatClass,
    });

    // กรองเที่ยวบินที่อยู่ในงบ
    const affordableFlights = allFlights.filter((flight: any) => {
      const totalFlightCost = flight.price * params.passengers;
      return totalFlightCost <= params.maxBudgetTotal;
    });

    // เรียงตามราคา (ถูก -> แพง)
    affordableFlights.sort((a: any, b: any) => a.price - b.price);

    console.log(`✅ Found ${affordableFlights.length} affordable flights`);
    return affordableFlights;
  }

  /**
   * ✅ ค้นหาร้านอาหารที่เหมาะสมกับงบประมาณ
   */
  async searchAffordableRestaurants(params: {
    destination: string;
    date: string;
    partySize: number;
    remainingBudget: number;
    cuisine?: string;
  }) {
    console.log(`🍽️ Budget left for restaurants: ${params.remainingBudget} THB`);
    
    const allRestaurants = await this.bookingsService.searchRestaurants({
      destination: params.destination,
      date: params.date,
      partySize: params.partySize,
      cuisine: params.cuisine,
    });

    // แปลง priceRange เป็นตัวเลข
    const getPriceLevel = (priceRange: string): number => {
      const bahtCount = (priceRange.match(/฿/g) || []).length;
      return bahtCount;
    };

    // กรองตามงบที่เหลือ
    let affordableRestaurants = allRestaurants;
    const budgetPercent = params.remainingBudget / 30000; // สมมติว่างบเต็มคือ 30,000

    if (budgetPercent < 0.3) {
      // งบเหลือน้อย (< 30%) -> เอาแค่ ฿ และ ฿฿
      affordableRestaurants = allRestaurants.filter((r: any) => 
        getPriceLevel(r.priceRange) <= 2
      );
    } else if (budgetPercent < 0.5) {
      // งบเหลือปานกลาง (30-50%) -> เอาแค่ ฿฿฿ ลงมา
      affordableRestaurants = allRestaurants.filter((r: any) => 
        getPriceLevel(r.priceRange) <= 3
      );
    }
    // ถ้างบเหลือเยอะ (> 50%) -> แสดงทั้งหมด

    console.log(`✅ Found ${affordableRestaurants.length} suitable restaurants`);
    return affordableRestaurants;
  }

  /**
   * ✅ สร้างแผนการเดินทาง (Itinerary)
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
   * ✅ แนะนำช่วงเวลาที่ดีที่สุด
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
   * ✅ Chat กับ AI
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
   * ✅ ค้นหาสถานที่ท่องเที่ยว
   */
  async searchDestinations(query: string): Promise<any[]> {
    const prompt = ChatPromptTemplate.fromMessages([
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
   * Default options (fallback) - ปรับให้หลากหลาย
   */
  private getDefaultOptions(input: SuggestDestinationsInput): TripOption[] {
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
}
