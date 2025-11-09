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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let WeatherService = class WeatherService {
    configService;
    apiKey;
    baseUrl = 'https://api.openweathermap.org/data/2.5';
    constructor(configService) {
        this.configService = configService;
        const key = this.configService.get('WEATHER_API_KEY');
        if (!key) {
            throw new Error('WEATHER_API_KEY is not defined in environment variables');
        }
        this.apiKey = key;
    }
    async getCurrentWeather(city) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/weather`, {
                params: {
                    q: city,
                    appid: this.apiKey,
                    units: 'metric',
                    lang: 'th',
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
        }
        catch (error) {
            console.error('Weather API Error:', error.response?.data || error.message);
            return null;
        }
    }
    async getForecast(city, days = 5) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/forecast`, {
                params: {
                    q: city,
                    appid: this.apiKey,
                    units: 'metric',
                    lang: 'th',
                    cnt: days * 8,
                },
            });
            return response.data.list.map((item) => ({
                date: item.dt_txt,
                temp: item.main.temp,
                description: item.weather[0].description,
                rainfall: item.rain?.['3h'] || 0,
            }));
        }
        catch (error) {
            console.error('Forecast API Error:', error.response?.data || error.message);
            return [];
        }
    }
    async getBestTravelTime(city) {
        const forecast = await this.getForecast(city, 5);
        if (!forecast || forecast.length === 0) {
            return 'ไม่สามารถดึงข้อมูลสภาพอากาศได้';
        }
        const goodDays = forecast.filter((day) => day.temp > 20 && day.temp < 32 && day.rainfall < 2);
        if (goodDays.length > 0) {
            return `แนะนำเดินทางใน 3-5 วันข้างหน้า อากาศดี อุณหภูมิ ${goodDays[0].temp}°C`;
        }
        return 'สภาพอากาศปัจจุบันอาจไม่เหมาะสมนัก แนะนำตรวจสอบอีกครั้งในสัปดาห์หน้า';
    }
};
exports.WeatherService = WeatherService;
exports.WeatherService = WeatherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WeatherService);
//# sourceMappingURL=weather.service.js.map