import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  // ATTENZIONE: Per la produzione vera e propria, usa EVERY_HOUR o EVERY_DAY_AT_MIDNIGHT.
  // Lasciamo EVERY_MINUTE per i test, ma fai attenzione ai limiti dell'API!
  @Cron(CronExpression.EVERY_HOUR)
  async checkPriceAlerts() {
    this.logger.log('Avvio controllo REALE dei Price Alerts sul mercato...');

    try {
      const alerts = await this.prisma.priceAlert.findMany({
        where: { isActive: true },
        include: { card: true },
      });

      if (alerts.length === 0) {
        this.logger.log('Nessun Price Alert attivo da controllare.');
        return;
      }

      for (const alert of alerts) {
        try {
          // 1. CHIAMATA REALE ALL'API ESTERNA
          // Sostituisci questo URL con quello esatto che usi per scaricare i dati della carta.
          // (Esempio: API di Pokémon TCG o TCGDex)
          const response = await fetch(`https://api.pokemontcg.io/v2/cards/${alert.cardId}`);
          
          if (!response.ok) {
            this.logger.error(`Impossibile contattare l'API per la carta ${alert.cardId}`);
            continue; // Salta questa carta e passa alla successiva
          }

          const data = await response.json();

          // 2. ESTRAZIONE DEL PREZZO REALE
          // Adatta questo percorso in base a come è fatto il JSON della tua API.
          // Questo è l'esempio standard se usi api.pokemontcg.io (prezzi TCGPlayer)
          let realMarketPrice = data.data?.tcgplayer?.prices?.normal?.market;

          // Fallback di sicurezza: se la carta reale non ha un prezzo, la saltiamo
          if (!realMarketPrice) {
            this.logger.warn(`Prezzo di mercato non disponibile per la carta ${alert.cardId}`);
            continue;
          }

          // Arrotondiamo a 2 decimali per pulizia
          realMarketPrice = parseFloat(realMarketPrice.toFixed(2));
          this.logger.log(`Prezzo attuale reale di ${alert.card.name}: $${realMarketPrice}`);

          // 3. AGGIORNIAMO IL DATABASE CON IL PREZZO REALE (Così la dashboard è sempre aggiornata!)
          await this.prisma.card.update({
            where: { id: alert.cardId },
            data: { priceUsd: realMarketPrice },
          });

          // 4. CONTROLLO CONDIZIONE: Il prezzo reale è sceso sotto (o uguale) alla soglia?
          if (realMarketPrice <= alert.targetPrice) {
            this.logger.log(`⚠️ TARGET REALE RAGGIUNTO! ${alert.card.name} costa $${realMarketPrice}`);

            await this.prisma.notification.create({
              data: {
                userId: alert.userId,
                message: `Ottime notizie! Il prezzo di mercato di ${alert.card.name} è sceso a $${realMarketPrice} (Il tuo target era $${alert.targetPrice}).`,
              },
            });

            await this.prisma.priceAlert.update({
              where: { id: alert.id },
              data: { isActive: false },
            });
          }

        } catch (cardError) {
          this.logger.error(`Errore nel controllo della carta ${alert.cardId}`, cardError);
        }

        // 5. SISTEMA ANTI-BAN (Rate Limiting)
        // Aspetta 1 secondo prima di controllare la prossima carta per non farsi bloccare dall'API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.logger.log('Controllo Price Alerts completato con successo.');
    } catch (error) {
      this.logger.error("Errore generico durante l'esecuzione del Cron Job", error);
    }
  }
}