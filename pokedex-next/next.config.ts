import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aggiungi questa riga per permettere l'accesso dal tuo Wi-Fi locale
  allowedDevOrigins: ['192.168.1.228'],
  
  // ... lascia qui eventuali altre configurazioni che avevi già
};

export default nextConfig;