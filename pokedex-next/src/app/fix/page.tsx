import prisma from '@/lib/prisma';

export default async function FixDatabasePage() {
  let message = "Operazione in corso...";
  let fixedCount = 0;

  try {
    // 1. Scarica gli elenchi UFFICIALI da TCGDex
    const [jaRes, enRes] = await Promise.all([
      fetch('https://api.tcgdex.net/v2/ja/sets', { cache: 'no-store' }),
      fetch('https://api.tcgdex.net/v2/en/sets', { cache: 'no-store' })
    ]);

    const jaSets = await jaRes.json();
    const enSets = await enRes.json();

    const jpIds = new Set(jaSets.map((s: any) => s.id.toLowerCase()));
    const enIds = new Set(enSets.map((s: any) => s.id.toLowerCase()));

    // 2. Legge i set attualmente nel tuo DB
    const dbSets = await prisma.set.findMany();

    // 3. Controlla e corregge le lingue mischiate
    for (const set of dbSets) {
      const setIdLower = set.id.toLowerCase();
      let correctLanguage = set.language;

      if (jpIds.has(setIdLower)) {
        correctLanguage = 'JP';
      } else if (enIds.has(setIdLower)) {
        correctLanguage = 'EN';
      }

      // Se c'è un errore nella lingua, lo corregge
      if (set.language !== correctLanguage) {
        await prisma.set.update({
          where: { id: set.id },
          data: { language: correctLanguage }
        });
        fixedCount++;
      }
    }
    
    message = `✨ Database pulito con successo! Sistemate le lingue di ${fixedCount} espansioni mischiate.`;
    
  } catch (error: any) {
    console.error("Errore fix DB:", error);
    message = `❌ Errore durante la pulizia: ${error.message}`;
  }

  // 4. Mostra a schermo il risultato in una pagina di servizio
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#38bdf8' }}>Manutenzione Database</h1>
      <p style={{ fontSize: '1.2rem', padding: '20px', backgroundColor: '#1e293b', borderRadius: '10px', display: 'inline-block', border: '1px solid #334155' }}>
        {message}
      </p>
      <div style={{ marginTop: '30px' }}>
        <a href="/" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>
          &larr; Torna alla Home e verifica
        </a>
      </div>
    </div>
  );
}