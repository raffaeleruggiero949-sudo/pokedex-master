import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aggiunge il prefisso /api a tutte le chiamate (es. localhost:3000/api/cards)
  app.setGlobalPrefix('api');

  // Abilita le chiamate dal Front-end React (fondamentale!)
  app.enableCors({
    origin: 'http://localhost:5173', // La porta standard di Vite/React
    credentials: true,
  });

  await app.listen(3000);
  console.log('🚀 Server Back-end in ascolto su http://localhost:3000');
}
bootstrap();