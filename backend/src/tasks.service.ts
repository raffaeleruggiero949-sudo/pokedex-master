import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE) // Mantiene il controllo ogni minuto per testarlo
  async checkPriceAlerts() {
    this.logger.log('Avvio controllo automatico dei Price Alerts...');

    try {
      // 1. Recupera SOLO gli alert ATTIVI (isActive: true)
      const alerts = await this.prisma.priceAlert.findMany({
        where: { isActive: true },
        include: { card: true },
      });

      if (alerts.length === 0) {
        this.logger.log('Nessun Price Alert attivo da controllare.');
        return;
      }

      for (const alert of alerts) {
        // Simuliamo un calo di prezzo (2€ in meno del target)
        const currentMarketPrice = alert.targetPrice - 2.0; 

        // 3. Controlla la condizione
        if (currentMarketPrice <= alert.targetPrice) {
          this.logger.log(`⚠️ TARGET RAGGIUNTO! ${alert.card.name} costa ${currentMarketPrice}€`);

          // 4. Crea la Notifica nel Database
          await this.prisma.notification.create({
            data: {
              userId: alert.userId,
              message: `Ottime notizie! Il prezzo di ${alert.card.name} è sceso a ${currentMarketPrice}€ (Il tuo target era ${alert.targetPrice}€).`,
            },
          });

          // 5. DISATTIVA l'alert invece di eliminarlo
          await this.prisma.priceAlert.update({
            where: { id: alert.id },
            data: { isActive: false },
          });
        }
      }

      this.logger.log('Controllo Price Alerts completato con successo.');
    } catch (error) {
      this.logger.error("Errore durante l'esecuzione del Cron Job", error);
    }
  }
}