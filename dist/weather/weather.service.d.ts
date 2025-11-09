import { ConfigService } from '@nestjs/config';
interface WeatherData {
    temp: number;
    feelsLike: number;
    description: string;
    humidity: number;
    rainfall: number;
}
export declare class WeatherService {
    private configService;
    private readonly apiKey;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    getCurrentWeather(city: string): Promise<WeatherData | null>;
    getForecast(city: string, days?: number): Promise<any>;
    getBestTravelTime(city: string): Promise<string>;
}
export {};
