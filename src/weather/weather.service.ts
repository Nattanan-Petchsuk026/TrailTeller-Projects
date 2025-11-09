/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  humidity: number;
  rainfall: number;
}

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private configService: ConfigService) {
    // ✅ แก้ไข: ตรวจสอบให้แน่ใจว่า WEATHER_API_KEY ถูกตั้งค่าใน environment variables
    const key = this.configService.get<string>('WEATHER_API_KEY');
    if (!key) {
      // eslint-disable-next-line prettier/prettier
      throw new Error('WEATHER_API_KEY is not defined in environment variables');
    }
    this.apiKey = key;
  }

  /**
   * ดึงข้อมูลสภาพอากาศปัจจุบัน
   */
  // ✅ แก้ไข: เปลี่ยน Promise<WeatherData> → Promise<WeatherData | null> เพื่อรองรับกรณี return null
  async getCurrentWeather(city: string): Promise<WeatherData | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric', // ใช้ Celsius
          lang: 'th', // ภาษาไทย
        },
      });

      const data = response.data;
      return {
        temp: data.main.temp,
        feelsLike: data.main.feels_like,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        rainfall: data.rain?.['1h'] || 0,
      };
    } catch (error) {
      // eslint-disable-next-line prettier/prettier
      console.error('Weather API Error:', error.response?.data || error.message);
      // ✅ แก้ไข: ตอนนี้ return null ได้อย่างถูกต้องเพราะ type รองรับแล้ว
      return null;
    }
  }

  /**
   * ดึงพยากรณ์อากาศ 5 วันข้างหน้า
   */
  async getForecast(city: string, days: number = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric',
          lang: 'th',
          cnt: days * 8, // 8 intervals per day (3-hour intervals)
        },
      });

      return response.data.list.map((item: any) => ({
        date: item.dt_txt,
        temp: item.main.temp,
        description: item.weather[0].description,
        rainfall: item.rain?.['3h'] || 0,
      }));
    } catch (error) {
      // eslint-disable-next-line prettier/prettier
      console.error('Forecast API Error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * แนะนำช่วงเวลาที่เหมาะสมตามสภาพอากาศ
   */
  async getBestTravelTime(city: string): Promise<string> {
    const forecast = await this.getForecast(city, 5);
    if (!forecast || forecast.length === 0) {
      return 'ไม่สามารถดึงข้อมูลสภาพอากาศได้';
    }

    // หาวันที่มีสภาพอากาศดีที่สุด (อุณหภูมิพอดี ฝนน้อย)
    const goodDays = forecast.filter(
      (day) => day.temp > 20 && day.temp < 32 && day.rainfall < 2,
    );

    if (goodDays.length > 0) {
      return `แนะนำเดินทางใน 3-5 วันข้างหน้า อากาศดี อุณหภูมิ ${goodDays[0].temp}°C`;
    }

    return 'สภาพอากาศปัจจุบันอาจไม่เหมาะสมนัก แนะนำตรวจสอบอีกครั้งในสัปดาห์หน้า';
  }
}
