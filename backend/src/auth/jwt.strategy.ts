import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Se vuoi, puoi sostituirlo con un process.env.JWT_SECRET per maggiore sicurezza
      secretOrKey: process.env.JWT_SECRET || 'pokedex-super-secret-key', 
    });
  }

  async validate(payload: any) {
    // Verifica che l'utente esista ancora nel DB
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // Quello che ritorniamo qui sarà accessibile come `req.user` nei controller protetti
    return { userId: payload.sub, email: payload.email };
  }
}