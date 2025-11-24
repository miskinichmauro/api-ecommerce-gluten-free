import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @HttpCode(200)
  @ApiOperation({ summary: 'Envia un correo simple usando SendGrid' })
  send(@Body() sendMailDto: SendMailDto) {
    return this.mailService.send(sendMailDto);
  }
}
