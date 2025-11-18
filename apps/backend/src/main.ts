import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        logger.error('❌ Validation Error:', JSON.stringify(errors, null, 2));
        return errors;
      },
    }),
  );

  // Support multiple origins for local and production
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-password'],
  });

  const port = parseInt(process.env.PORT || '3001', 10);
  
  logger.log(`🚀 Starting NestJS application...`);
  logger.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🔗 CORS Origins: ${allowedOrigins.join(', ')}`);
  logger.log(`🌐 Binding to: 0.0.0.0:${port}`);
  
  await app.listen(port, '0.0.0.0'); // Listen on all interfaces for Railway
  
  logger.log(`✅ Backend server ready on http://0.0.0.0:${port}`);
  logger.log(`✅ Server is listening and ready to accept connections`);
}

bootstrap().catch((error) => {
  logger.error('❌ Failed to start application:', error);
  process.exit(1);
});

