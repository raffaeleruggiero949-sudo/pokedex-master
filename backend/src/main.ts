import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Rimosso app.setGlobalPrefix('api') per far combaciare perfettamente
  // le rotte con i bottoni del frontend che abbiamo appena creato.

  app.enableCors({
    // Autorizziamo ESPLICITAMENTE il frontend Next.js (porta 3000) a fare richieste
    origin: ['http://localhost:3000'], 
    credentials: true,
  });

  // Spostiamo il back-end sulla porta 3001 per non entrare in conflitto con Next.js
  await app.listen(3001);
  console.log('🚀 Server Back-end NestJS in ascolto su http://localhost:3001');
}
bootstrap();