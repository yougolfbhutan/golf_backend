/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { Booking } from '../booking/entities/booking.entity';

import { buildAdminBookingEmail } from './booking-admin.template';
import { buildBookingConfirmationEmail } from './booking-confirmation.template';
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly from: string;
  private readonly replyTo?: string;
  private readonly adminEmails: string[];

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;

    if (!apiKey) throw new Error('RESEND_API_KEY is not set');
    if (!from) throw new Error('MAIL_FROM is not set');

    this.resend = new Resend(apiKey);
    this.from = from;
    this.replyTo = process.env.ADMIN_NOTIFY_EMAIL || undefined;
    this.adminEmails = (process.env.ADMIN_NOTIFY_EMAIL ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
  }

  /** Sends the customer and admin emails independently. Never throws. */
  async sendBookingEmails(booking: Booking): Promise<void> {
    const [customer, admin] = await Promise.allSettled([
      this.sendToCustomer(booking),
      this.sendToAdmins(booking),
    ]);

    if (customer.status === 'rejected') {
      this.logger.error(
        `Customer email failed for booking ${booking.id}`,
        customer.reason instanceof Error ? customer.reason.stack : String(customer.reason),
      );
    }
    if (admin.status === 'rejected') {
      this.logger.error(
        `Admin email failed for booking ${booking.id}`,
        admin.reason instanceof Error ? admin.reason.stack : String(admin.reason),
      );
    }
  }

  private async sendToCustomer(booking: Booking): Promise<void> {
    const to = booking.customer?.email;
    if (!to) {
      this.logger.warn(`Booking ${booking.id} has no customer email, skipping customer email`);
      return;
    }

    const { subject, html, text } = buildBookingConfirmationEmail(booking);
    const { data, error } = await this.resend.emails.send(
      {
        from: this.from,
        to,
        subject,
        html,
        text,
        replyTo: this.replyTo,
        tags: [{ name: 'type', value: 'booking_confirmation' }],
      },
      { idempotencyKey: `booking-confirmation/${booking.id}` },
    );

    if (error) throw new Error(`Resend error: ${error.name} – ${error.message}`);
    this.logger.log(`Customer email sent for booking ${booking.id} (${data?.id})`);
  }

  private async sendToAdmins(booking: Booking): Promise<void> {
    if (this.adminEmails.length === 0) {
      this.logger.warn('ADMIN_NOTIFY_EMAIL is not set, skipping admin email');
      return;
    }

    const { subject, html, text } = buildAdminBookingEmail(booking);
    const { data, error } = await this.resend.emails.send(
      {
        from: this.from,
        to: this.adminEmails,
        subject,
        html,
        text,
        // Admin can hit Reply and write straight to the customer
        replyTo: booking.customer?.email ?? this.replyTo,
        tags: [{ name: 'type', value: 'booking_admin_notification' }],
      },
      { idempotencyKey: `booking-admin/${booking.id}` },
    );

    if (error) throw new Error(`Resend error: ${error.name} – ${error.message}`);
    this.logger.log(`Admin email sent for booking ${booking.id} (${data?.id})`);
  }
}