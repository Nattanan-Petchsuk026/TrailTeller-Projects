import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class AiService {
  private model: ChatGoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    // Initialize Google Gemini 2.5 Flash
    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash-exp',
      apiKey: this.configService.get<string>('GOOGLE_API_KEY'),
      temperature: 0.7, // ความคิดสร้างสรรค์ปานกลาง
      maxOutputTokens: 2048,
    });
  }

  /**
   * แนะนำจุดหมายปลายทางตามความต้องการของผู้ใช้
   */
  async suggestDestinations(input: {
    budget: number;
    interests: string[];
    travelStyle: string;
    duration: number; // จำนวนวัน
    preferredSeason?: string;
  }): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
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

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

    const response = await chain.invoke({
      budget: input.budget.toLocaleString('th-TH'),
      interests: input.interests.join(', '),
      travelStyle: input.travelStyle,
      duration: input.duration,
      preferredSeason: input.preferredSeason || 'ไม่ระบุ',
    });

    return response;
  }

  /**
   * สร้างแผนการเดินทาง (Itinerary) แบบละเอียด
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
   * วิเคราะห์และแนะนำช่วงเวลาที่เหมาะสมในการเดินทาง
   */
  async suggestBestTravelTime(destination: string): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
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

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

    const response = await chain.invoke({ destination });

    return response;
  }

  /**
   * Chat แบบทั่วไปกับ AI Travel Assistant
   */
  async chat(message: string, context?: string): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
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

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

    const response = await chain.invoke({ message });

    return response;
  }
}
