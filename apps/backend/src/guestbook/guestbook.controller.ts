import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateGuestbookMessageDto } from './dto/create-guestbook-message.dto';
import { GuestbookService } from './guestbook.service';

@Controller('guestbook/messages')
export class GuestbookController {
  constructor(private readonly guestbookService: GuestbookService) {}

  @Get()
  list() {
    return this.guestbookService.listMessages();
  }

  @Post()
  create(@Body() dto: CreateGuestbookMessageDto) {
    return this.guestbookService.createMessage(dto);
  }
}
