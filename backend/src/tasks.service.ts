import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service'; // Controlla che il percorso sia corretto

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) <-- Usa questo in produzione
  @Cron(CronExpression.EVERY_MINUTE) // <-- Usiamo EVERY_MINUTE per testarlo subito!
  async checkPriceAlerts() {
    this.logger.log('Avvio controllo automatico dei Price Alerts...');

    try {
      // 1. Recupera tutti gli alert dal database
      const alerts = await this.prisma.priceAlert.findMany({
        include: { card: true }, // Includiamo i dati della carta per avere il nome
      });

      if (alerts.length === 0) {
        this.logger.log('Nessun Price Alert da controllare.');
        return;
      }

      for (const alert of alerts) {
        // 2. SIMULAZIONE: Qui andrà la chiamata vera alle API di TCGDex per la carta specifica.
        // const tcgDexData = await fetch(`https://api.tcgdex.net/v2/en/cards/${alert.card.id}`);
        // const realPrice = ...
        
        // Per ora simuliamo un calo di prezzo:
        const currentMarketPrice = alert.targetPrice - 2.0; // Simuliamo che costi 2€ in meno del target

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

          // 5. Elimina l'alert per non inviare la notifica all'infinito ogni minuto
          await this.prisma.priceAlert.delete({
            where: { id: alert.id },
          });
        }
      }

      this.logger.log('Controllo Price Alerts completato con successo.');
    } catch (error) {
      this.logger.error("Errore durante l'esecuzione del Cron Job", error);
    }
  }
}