import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestbookMessageDto } from './dto/create-guestbook-message.dto';

@Injectable()
export class GuestbookService {
  constructor(private readonly prisma: PrismaService) {}

  listMessages() {
    return this.prisma.guestbookMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  createMessage(dto: CreateGuestbookMessageDto) {
    return this.prisma.guestbookMessage.create({
      data: {
        nickname: dto.nickname.trim(),
        content: dto.content.trim(),
      },
    });
  }
}
