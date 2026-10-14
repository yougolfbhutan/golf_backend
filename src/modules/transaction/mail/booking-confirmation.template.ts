/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// mail/templates/booking-confirmation.template.ts
import { Booking } from '../booking/entities/booking.entity';
import {
  BRAND,
  COLORS,
  SUPPORT_EMAIL,
  BuiltEmail,
  escapeHtml,
  formatDate,
  formatTime,
  itemName,
  money,
} from './email.helpers';

export function buildBookingConfirmationEmail(booking: Booking): BuiltEmail {
  const customerName = booking.customer?.name?.trim() || 'there';
  const courseName = booking.golfCourse?.name ?? 'Golf course';
  const date = formatDate(booking.teeDate);
  const time = formatTime(booking.teeTime);
  const ref = `#${booking.id}`;
  const items = booking.items ?? [];

  const subject = `Booking ${ref} confirmed – ${courseName}, ${date}`;
  const preheader = `${courseName} on ${date} at ${time} for ${booking.numberOfGolfers} golfer(s).`;

  const sectionLabel = (label: string): string =>
    `<p style="margin:0 0 4px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:${COLORS.accent};font-weight:700;">${label}</p>`;

  const detailRow = (label: string, value: string): string => `
    <tr>
      <td style="padding:8px 0;color:${COLORS.muted};font-size:14px;width:40%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:${COLORS.text};font-size:14px;font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`;

  const itemRows = items
    .map((i) => {
      const lineTotal = Number(i.unitPrice) * i.quantity;
      return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};color:${COLORS.text};font-size:14px;">${escapeHtml(itemName(i))}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};color:${COLORS.muted};font-size:14px;text-align:center;">× ${i.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};color:${COLORS.text};font-size:14px;text-align:right;">${escapeHtml(money(booking.currency, lineTotal))}</td>
    </tr>`;
    })
    .join('');

  const rentalsSection = items.length
    ? `
        <tr><td style="padding:24px 32px 0;">
          ${sectionLabel('Rentals')}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${itemRows}
            <tr>
              <td colspan="2" style="padding:12px 0 0;color:${COLORS.text};font-size:15px;font-weight:700;">Rental total</td>
              <td style="padding:12px 0 0;color:${COLORS.primary};font-size:16px;font-weight:700;text-align:right;">${escapeHtml(money(booking.currency, booking.totalAmount))}</td>
            </tr>
          </table>
        </td></tr>`
    : '';

  const notesSection = booking.notes
    ? `
        <tr><td style="padding:24px 32px 0;">
          ${sectionLabel('Your notes')}
          <p style="margin:0;font-size:14px;color:${COLORS.text};line-height:1.5;">${escapeHtml(booking.notes)}</p>
        </td></tr>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <!-- Preheader: inbox preview text -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.bg};">
    <tr><td align="center" style="padding:24px 12px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
             style="width:100%;max-width:600px;background:${COLORS.card};border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:${COLORS.primary};padding:28px 32px;">
            <p style="margin:0;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.accent};font-weight:700;">${escapeHtml(BRAND)}</p>
            <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;color:#ffffff;">Your tee time is confirmed</h1>
          </td>
        </tr>

        <!-- Greeting -->
        <tr><td style="padding:28px 32px 0;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:${COLORS.text};">
            Hello ${escapeHtml(customerName)}, thank you for booking with us. Here are your details.
          </p>
        </td></tr>

        <!-- Booking details -->
        <tr><td style="padding:24px 32px 0;">
          ${sectionLabel(`Booking ${escapeHtml(ref)}`)}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="border-top:1px solid ${COLORS.border};border-bottom:1px solid ${COLORS.border};">
            ${detailRow('Course', courseName)}
            ${detailRow('Date', date)}
            ${detailRow('Tee time', time)}
            ${detailRow('Golfers', String(booking.numberOfGolfers))}
          </table>
        </td></tr>

        ${rentalsSection}
        ${notesSection}

        <!-- Help -->
        <tr><td style="padding:28px 32px 32px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:${COLORS.muted};">
            Need to change or cancel? Reply to this email or contact us at
            <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:${COLORS.primary};">${escapeHtml(SUPPORT_EMAIL)}</a>.
            Please arrive 30 minutes before your tee time.
          </p>
        </td></tr>
      </table>

      <p style="margin:16px 0 0;font-size:12px;color:${COLORS.muted};">
        © ${new Date().getFullYear()} ${escapeHtml(BRAND)}. You received this because you made a booking with us.
      </p>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `${BRAND} - Your tee time is confirmed`,
    '',
    `Hello ${customerName},`,
    '',
    `Booking ${ref}`,
    `Course:   ${courseName}`,
    `Date:     ${date}`,
    `Tee time: ${time}`,
    `Golfers:  ${booking.numberOfGolfers}`,
    ...(items.length
      ? [
          '',
          'Rentals:',
          ...items.map(
            (i) =>
              `- ${itemName(i)} x ${i.quantity}  ${money(booking.currency, Number(i.unitPrice) * i.quantity)}`,
          ),
          `Rental total: ${money(booking.currency, booking.totalAmount)}`,
        ]
      : []),
    ...(booking.notes ? ['', `Notes: ${booking.notes}`] : []),
    '',
    `Need to change or cancel? Contact ${SUPPORT_EMAIL}.`,
    'Please arrive 30 minutes before your tee time.',
  ].join('\n');

  return { subject, html, text };
}
