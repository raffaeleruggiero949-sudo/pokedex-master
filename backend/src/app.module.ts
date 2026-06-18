import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Importiamo i moduli che abbiamo creato
import { PrismaModule } from './prisma/prisma.module';
import { CardsModule } from './cards/cards.module';
import { SetsModule } from './sets/sets.module'; 

@Module({
  // Qui è dove "agganciamo" i nostri moduli al server principale!
  imports: [PrismaModule, CardsModule, SetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}