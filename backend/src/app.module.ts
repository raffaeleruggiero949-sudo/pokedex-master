import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardsModule } from './cards/cards.module';
import { SetsModule } from './sets/sets.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule'; // Importato per i prezzi automatici

@Module({
  imports: [
    PrismaModule,
    CardsModule,
    SetsModule,
    ScheduleModule.forRoot(), // Inizializza il Cron Job
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}