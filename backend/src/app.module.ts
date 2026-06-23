import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardsModule } from './cards/cards.module';
import { SetsModule } from './sets/sets.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule'; // Importato per i prezzi automatici
import { AuthModule } from './auth/auth.module';
import { CollectionModule } from './collection/collection.module';

@Module({
  imports: [
    PrismaModule,
    CardsModule,
    SetsModule,
    ScheduleModule.forRoot(), // Inizializza il Cron Job
    AuthModule,
    CollectionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}