import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  // Ho aggiunto il metodo create mancante
  async create(createCardDto: CreateCardDto) {
    // La logica di creazione la faremo più avanti se servirà
    return 'This action adds a new card';
  }

 async findAll(page: number = 1, limit: number = 10) {
    // Calcoliamo quanti record saltare. Es: Pagina 2 con limite 10 = salta i primi 10.
    const skip = (page - 1) * limit;

    // Eseguiamo due query contemporaneamente: prendiamo le carte e contiamo il totale esatto
    const [cards, total] = await Promise.all([
      this.prisma.card.findMany({
        skip,
        take: limit,
        include: { set: true },
      }),
      this.prisma.card.count(),
    ]);

    // Restituiamo un oggetto strutturato, non più un semplice array
    return {
      data: cards,
      meta: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async findOne(id: string) {
    return this.prisma.card.findUnique({
      where: { id },
      include: { set: true },
    });
  }

  async update(id: string, updateCardDto: UpdateCardDto) {
    return this.prisma.card.update({
      where: { id },
      data: updateCardDto as any, 
    });
  }

  async remove(id: string) {
    return this.prisma.card.delete({
      where: { id },
    });
  }
}