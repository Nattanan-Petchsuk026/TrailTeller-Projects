import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { WeatherModule } from '../weather/weather.module'; // ← เพิ่ม

@Module({
  imports: [ConfigModule, WeatherModule], // ← เพิ่ม WeatherModule
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
