import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
 
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security: Helmet helps secure your apps by setting various HTTP headers desta..........
  app.use(helmet());

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable CORS for Flutter and other frontend clients
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    exposedHeaders: 'Content-Length, X-Requested-With',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
    credentials: true,
  });

  // No global prefix as it's handled by the frontend baseUrl  desta
  app.setGlobalPrefix('api');

  // Global validation pipe this updatei
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const basePort = parseInt(process.env.PORT ?? '3000', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  // Try a few ports if the preferred one is already in usez
  for (let i = 0; i < 5; i++) {
    const port = basePort + i;
    try {
      await app.listen(port, host);
      logger.log(`Nest application listening on http://${host}:${port}`);
      return;
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === 'EADDRINUSE') {
        logger.warn(`Port ${port} in use, trying ${port + 1}...`);
      } else {
        if (err instanceof Error) {
          logger.error(`Failed to start the application: ${err.message}`);
        } else {
          logger.error('Failed to start the application: unknown error');
          logger.debug(String(err));
        }
        throw err;
      }
    }
  }
}

bootstrap().catch((err: unknown) => {
  const logger = new Logger('Bootstrap');
  if (err instanceof Error) {
    logger.error(`Critical error during bootstrap: ${err.message}`);
  } else {
    logger.error('Critical error during bootstrap: unknown error');
    logger.debug(String(err));
  }
  process.exit(1);
});
