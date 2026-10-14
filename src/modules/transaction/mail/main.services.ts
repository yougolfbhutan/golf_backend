// mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Booking } from '../booking/entities/booking.entity';

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.resend = new Resend(config.getOrThrow<string>('RESEND_API_KEY'));
    this.from = config.getOrThrow<string>('MAIL_FROM');
  }

  async sendBookingConfirmation(booking: Booking): Promise<void> {
    const to = booking.customer?.email;
    if (!to) {
      this.logger.warn(`Booking ${booking.id} has no customer email, skipping`);
      return;
    }

    const itemsHtml = (booking.items ?? [])
      .map(
        (i) =>
          `<li>${escapeHtml(String(i.quantity))} × ${escapeHtml(i.name ?? 'Item')}</li>`,
      )
      .join('');

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Booking confirmed – ${booking.teeDate} ${booking.teeTime}`,
      html: `
        <h2>Your booking is confirmed</h2>
        <p>Hello ${escapeHtml(booking.customer.name ?? 'there')},</p>
        <p><strong>Course:</strong> ${escapeHtml(booking.golfCourse?.name ?? '')}<br/>
           <strong>Date:</strong> ${escapeHtml(String(booking.teeDate))}<br/>
           <strong>Tee time:</strong> ${escapeHtml(String(booking.teeTime))}<br/>
           <strong>Golfers:</strong> ${booking.numberOfGolfers}<br/>
           <strong>Total:</strong> ${booking.totalAmount}</p>
        ${itemsHtml ? `<p>Rentals:</p><ul>${itemsHtml}</ul>` : ''}
      `,
    });

    if (error) {
      throw new Error(`Resend error: ${error.name} – ${error.message}`);
    }
  }
}
