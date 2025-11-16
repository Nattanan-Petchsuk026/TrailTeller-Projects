import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // เปิดใช้ validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ลบ field ที่ไม่ได้ define ใน DTO
      forbidNonWhitelisted: false, // แจ้ง error ถ้ามี field แปลกปลอม
      transform: true, // แปลง type อัตโนมัติ
    }),
  );

  // เปิดใช้ CORS (สำหรับ React Native)
  app.enableCors();

  await app.listen(3000);
  console.log(`🚀 Backend is running on: http://localhost:3000`);
}
bootstrap();
