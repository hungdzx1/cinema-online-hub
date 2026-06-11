import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. BẬT validation cho TẤT CẢ DTO (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ field không khai báo trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu gửi field lạ
      transform: true, // Tự động chuyển kiểu (string "5" -> number 5)
    }),
  );

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
