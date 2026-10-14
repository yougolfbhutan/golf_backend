/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Booking } from '../booking/entities/booking.entity';
import {
  BRAND, COLORS, BuiltEmail, escapeHtml, formatDate, formatTime,
} from './email.helpers';

export function buildAdminBookingEmail(booking: Booking): BuiltEmail {
  const c = booking.customer;
  const courseName = booking.golfCourse?.name ?? 'Golf course';
  const date = formatDate(booking.teeDate);
  const time = formatTime(booking.teeTime);

  const customerName = c?.name?.trim() || 'Unknown customer';
  const email = c?.email ?? '-';
  const phone = c?.phone_no ?? '-';

  const subject = `New booking #${booking.id} – ${courseName}, ${booking.teeDate} ${time}`;

  const row = (label: string, value: string): string => `
    <tr>
      <td style="padding:6px 0;color:${COLORS.muted};font-size:14px;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;color:${COLORS.text};font-size:14px;font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`;


  const heading = (t: string): string =>
    `<p style="margin:24px 0 4px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:${COLORS.accent};font-weight:700;">${t}</p>`;

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
             style="width:100%;max-width:600px;background:${COLORS.card};border-radius:12px;overflow:hidden;">
        <tr><td style="background:${COLORS.primary};padding:22px 32px;">
          <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.accent};font-weight:700;">${escapeHtml(BRAND)} · Admin</p>
          <h1 style="margin:6px 0 0;font-size:22px;color:#ffffff;">New booking #${booking.id}</h1>
        </td></tr>
        <tr><td style="padding:8px 32px 28px;">
          ${heading('Customer')}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${COLORS.border};">
            ${row('Name', customerName)}
            ${row('Email', email)}
            ${row('Phone', phone)}
          </table>

          ${heading('Booking')}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${COLORS.border};">
            ${row('Course', courseName)}
            ${row('Date', date)}
            ${row('Tee time', time)}
            ${row('Golfers', String(booking.numberOfGolfers))}
            ${row('Status', booking.status)}
          </table>

          ${booking.notes ? `${heading('Customer notes')}<p style="margin:0;font-size:14px;line-height:1.5;color:${COLORS.text};">${escapeHtml(booking.notes)}</p>` : ''}

          <p style="margin:24px 0 0;font-size:13px;color:${COLORS.muted};">Reply to this email ${email} to contact the customer directly.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `New booking #${booking.id}`,
    '',
    'CUSTOMER',
    `Name:  ${customerName}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    '',
    'BOOKING',
    `Course:       ${courseName}`,
    `Date:         ${date}`,
    `Tee time:     ${time}`,
    `Golfers:      ${booking.numberOfGolfers}`,
    `Status:       ${booking.status}`,  
    ...(booking.notes ? ['', `NOTES: ${booking.notes}`] : []),
  ].join('\n');

  return { subject, html, text };
}