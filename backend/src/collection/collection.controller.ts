import { Controller, Post, Delete, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post('add')
  async addCard(
    @Request() req, 
    @Body() body: { cardId: string; variant?: string; condition?: string }
  ) {
    // req.user viene popolato automaticamente dal JwtStrategy!
    const userId = req.user.userId; 
    return this.collectionService.addCard(userId, body.cardId, body.variant, body.condition);
  }

  @Delete('remove/:cardId/:variant')
  async removeCard(
    @Request() req, 
    @Param('cardId') cardId: string, 
    @Param('variant') variant: string
  ) {
    const userId = req.user.userId;
    return this.collectionService.removeCard(userId, cardId, variant);
  }

  @Get('progress/:setId')
  async getProgress(@Request() req, @Param('setId') setId: string) {
    const userId = req.user.userId;
    return this.collectionService.getSetProgress(userId, setId);
  }

  @Get()
  async getCollection(@Request() req) {
    const userId = req.user.userId;
    return this.collectionService.getUserCollection(userId);
  }
}