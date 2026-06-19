import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; // <-- 1. Importa questo
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CardsModule } from './cards/cards.module';
import { SetsModule } from './sets/sets.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // <-- 2. Inizializza il modulo qui
    PrismaModule, 
    CardsModule, 
    SetsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}