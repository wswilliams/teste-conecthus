import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Enable global DTO validation
  app.useGlobalPipes(new ValidationPipe());

  // Configure Swagger Options
  const config = new DocumentBuilder()
    .setTitle('NestJS CRUD API')
    .setDescription('The Prisma CRUD API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Path to view documentation: http://localhost:3000/api

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
