import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { CreateWhatsappDto } from './dto/create-whatsapp.dto';

interface WhatsappApiResponse {
  messages?: { id: string }[];
}

dotenv.config();

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  async sendFormSubmission(dto: CreateWhatsappDto): Promise<string> {
    const phoneNumberId = process.env.WA_PHONE_NUMBER_ID?.trim();
    const accessToken = process.env.WA_ACCESS_TOKEN?.trim();
    const recipient = (process.env.WA_RECIPIENT ?? '')
      .trim()
      .replace(/\D/g, '');
    const apiVersion = process.env.WA_API_VERSION?.trim() || 'v21.0';

    if (!phoneNumberId || !accessToken || !recipient) {
      this.logger.error(
        'Missing WA_PHONE_NUMBER_ID, WA_ACCESS_TOKEN or WA_RECIPIENT',
      );
      throw new Error('WhatsApp configuration is incomplete');
    }

    const lines = [
      'New form submission',
      `Name: ${dto.name}`,
      `Phone: ${dto.phone}`,
      `Date: ${dto.date}`,
    ];
    if (dto.notes) {
      lines.push(`Notes: ${dto.notes}`);
    }

    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'text',
        text: { body: lines.join('\n') },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`WhatsApp API error ${response.status}: ${errorBody}`);
      throw new Error(`WhatsApp API responded with status ${response.status}`);
    }

    const json = (await response.json()) as WhatsappApiResponse;
    const messageId = json.messages?.[0]?.id;

    if (!messageId) {
      this.logger.error(`No message id returned: ${JSON.stringify(json)}`);
      throw new Error('WhatsApp API returned no message id');
    }

    return messageId;
  }
}
