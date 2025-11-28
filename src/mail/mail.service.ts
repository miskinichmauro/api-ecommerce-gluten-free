import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.fromEmail = this.configService.get<string>('MAIL_FROM_EMAIL') ?? '';
    this.fromName = this.configService.get<string>('MAIL_FROM_NAME') ?? '';

    if (!apiKey) {
      this.logger.error('SENDGRID_API_KEY no esta configurada');
    } else {
      sgMail.setApiKey(apiKey);
    }
  }

  async send(sendMailDto: SendMailDto) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException({
        message: 'SENDGRID_API_KEY no está configurada',
        code: 'MAIL_API_KEY_MISSING',
        expose: false,
      });
    }

    if (!this.fromEmail) {
      throw new InternalServerErrorException({
        message: 'MAIL_FROM_EMAIL no está configurado',
        code: 'MAIL_FROM_EMAIL_MISSING',
        expose: false,
      });
    }

    const msg: MailDataRequired = {
      to: sendMailDto.to,
      from: this.fromName ? { email: this.fromEmail, name: this.fromName } : this.fromEmail,
      subject: sendMailDto.subject,
      html: sendMailDto.html,
    };

    if (sendMailDto.text) {
      msg.text = sendMailDto.text;
    }

    try {
      const [response] = await sgMail.send(msg);
      return { status: response.statusCode };
    } catch (error) {
      this.logger.error('Error enviando correo', error as Error);
      throw new InternalServerErrorException({
        message: 'No se pudo enviar el correo',
        code: 'MAIL_SEND_FAILED',
        expose: false,
      });
    }
  }
}
