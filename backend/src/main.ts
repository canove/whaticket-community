import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3001);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: true, // Allow any origin (reflects request origin), facilitating access via IP/Hostname
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API Documentation
  if (configService.get<string>('app.nodeEnv') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Whaticket Enterprise API')
      .setDescription('API documentation for Whaticket Enterprise')
      .setVersion('2.0.0')
      .addBearerAuth()
      .addTag('WhatsApp', 'WhatsApp connection management')
      .addTag('Tickets', 'Ticket management')
      .addTag('Messages', 'Message handling')
      .addTag('Contacts', 'Contact management')
      .addTag('Users', 'User management')
      .addTag('Auth', 'Authentication')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log(`Swagger documentation available at /docs`);
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📧 WhatsApp service using Baileys`);
}

void bootstrap();
