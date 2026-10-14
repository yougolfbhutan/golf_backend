import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { CreateWhatsappDto } from './dto/create-whatsapp.dto';

export interface SubmitFormResponse {
  success: boolean;
  message: string;
  messageId: string;
}

@Controller('form')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submit(@Body() dto: CreateWhatsappDto): Promise<SubmitFormResponse> {
    try {
      // If you also save to a database, save here FIRST, then send WhatsApp
      const messageId = await this.whatsappService.sendFormSubmission(dto);

      return {
        success: true,
        message: 'Form submitted successfully',
        messageId,
      };
    } catch (error) {
      this.logger.error(
        'Failed to send WhatsApp notification',
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        {
          success: false,
          message:
            'Could not send WhatsApp notification. Please try again later.',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
