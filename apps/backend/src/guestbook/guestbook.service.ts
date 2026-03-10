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

  async createMessage(dto: CreateGuestbookMessageDto, userId?: number) {
    let nickname = dto.nickname?.trim() || '匿名用户';

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      if (user) {
        nickname = user.name?.trim() || user.email.split('@')[0] || nickname;
      }
    }

    return this.prisma.guestbookMessage.create({
      data: {
        nickname,
        content: dto.content.trim(),
      },
    });
  }
}
