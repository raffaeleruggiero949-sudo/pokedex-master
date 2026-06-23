# Pokédex Master

Pokédex Master è un'applicazione web full-stack sviluppata come Single Page Application (SPA) per la gestione e l'analisi di collezioni di carte. L'applicazione offre funzionalità di ricerca avanzata, filtraggio, profilazione utente e una dashboard statistica per il monitoraggio del valore della collezione.

## Architettura e Tecnologie
Il progetto è sviluppato utilizzando **Next.js**, che permette di gestire sia il Front-end che il Back-end all'interno dello stesso ecosistema:
*   **Front-end:** React, Next.js (App Router), Tailwind CSS. I componenti si trovano principalmente nella root di `app/` e nelle relative sottocartelle.
*   **Back-end:** Next.js API Routes (disponibili in `app/api/`). L'applicazione espone endpoint RESTful.
*   **Database:** PostgreSQL, gestito tramite l'ORM Prisma.
*   **Testing:** Playwright per i test End-to-End (E2E).

---

## Requisiti di Sistema
Per eseguire correttamente il progetto, è necessario avere installati sul proprio computer:
*   **Node.js** (versione 18.x o superiore)
*   **Docker** e **Docker Desktop / Compose** (per avviare l'istanza del database PostgreSQL)

---

## 1. Configurazione Iniziale

### Variabili d'Ambiente
Crea un file denominato `.env` nella directory principale del progetto (allo stesso livello del `package.json`) e inserisci le seguenti variabili d'ambiente. 

```env
# Connessione al database PostgreSQL locale tramite Docker
DATABASE_URL="postgresql://admin:admin123@localhost:5432/pokedex_db?schema=public"

# Segreto per la generazione dei JWT (Autenticazione)
JWT_SECRET="chiave_segreta_per_esame_sviluppo_web"
