import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateGuestbookMessageDto } from './dto/create-guestbook-message.dto';
import { GuestbookService } from './guestbook.service';

@Controller('guestbook/messages')
export class GuestbookController {
  constructor(private readonly guestbookService: GuestbookService) {}

  @Get()
  list() {
    return this.guestbookService.listMessages();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateGuestbookMessageDto,
    @CurrentUser('sub') userId?: number,
  ) {
    return this.guestbookService.createMessage(dto, userId);
  }
}
