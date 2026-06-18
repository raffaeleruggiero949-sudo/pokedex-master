import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    // Aggiornato per consentire l'accesso a Next.js!
    origin: ['http://localhost:5173', 'http://localhost:3001'], 
    credentials: true,
  });

  await app.listen(3000);
  console.log('🚀 Server Back-end in ascolto su http://localhost:3000');
}
bootstrap();