import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Questa parolina magica permette agli altri file di trovarlo senza errori!
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Devi esportarlo per farlo usare agli altri
})
export class PrismaModule {}