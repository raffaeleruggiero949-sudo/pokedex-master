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

Installazione delle Dipendenze
Scarica tutte le dipendenze necessarie tramite il Node Package Manager:

Bash
npm install
2. Avvio del Database (Docker)
Il progetto include un file docker-compose.yml preconfigurato per sollevare un'istanza di PostgreSQL isolata.

Avvia il container in background eseguendo:

Bash
docker-compose up -d
(Nota: assicurati che la porta 5432 del tuo sistema sia libera).

3. Inizializzazione del Database (Prisma)
Una volta che il database è in esecuzione, è necessario applicare lo schema e creare le tabelle. Esegui la migrazione con il seguente comando:

Bash
npx prisma migrate dev --name init
Questo comando applicherà le migrazioni e genererà automaticamente il client Prisma necessario al back-end per comunicare con il database.

4. Avvio dell'Applicazione
Ora è possibile avviare il server di sviluppo Next.js (che avvierà simultaneamente sia il back-end che il front-end):

Bash
npm run dev
L'applicazione sarà accessibile dal browser all'indirizzo: http://localhost:3000

5. Esecuzione dei Test End-to-End (E2E)
Il progetto include una suite di 10 test automatici E2E sviluppati con Playwright, che simulano le interazioni dell'utente (ricerca, filtraggio, navigazione, cambio lingua).

Prima di eseguire i test per la prima volta, installa i browser necessari a Playwright:

Bash
npx playwright install
Per lanciare i test, assicurati che l'applicazione sia in esecuzione (tramite npm run dev in un altro terminale) ed esegui:

Bash
npx playwright test
Per visualizzare il report HTML dettagliato dei test appena conclusi:

Bash
npx playwright show-report
Spegnimento
Per arrestare l'applicazione, premi CTRL + C nel terminale dove è in esecuzione Next.js.
Per arrestare e rimuovere il container del database:

Bash
docker-compose down

***

### 💡 Nota importante sul Docker Compose
Il README presuppone che tu abbia un file `docker-compose.yml` nella cartella principale del progetto per far partire PostgreSQL. Se non lo hai ancora creato, eccoti il codice standard da inserire in un nuovo file `docker-compose.yml`:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    container_name: pokedex_postgres
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: pokedex_db
    ports:
      - "5432:5432"
    volumes:
      - pokedex_data:/var/lib/postgresql/data

volumes:
  pokedex_data:
