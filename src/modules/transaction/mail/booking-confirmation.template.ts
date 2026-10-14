/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// mail/templates/booking-confirmation.template.ts
import { createHmac } from 'crypto';
import * as QRCode from 'qrcode';
import { Booking } from '../booking/entities/booking.entity';
import {
  BRAND,
  COLORS,
  SUPPORT_EMAIL,
  BuiltEmail,
  escapeHtml,
  formatDate,
  formatTime,
} from './email.helpers';

const QR_CID = 'booking-qr';

export interface BuiltEmailWithAttachments extends BuiltEmail {
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
    contentId: string;
  }[];
}

// Gmail/Outlook block base64 images, so the QR is sent as an inline (cid:) attachment.
async function generateQr(booking: Booking): Promise<Buffer | null> {
  try {
    const c = booking.customer;

    const data = {
      v: 1,
      ref: booking.id,
      status: booking.status,
      customer: {
        id: booking.customerId,
        name: c?.name ?? null,
        email: c?.email ?? null,
        phone: c?.phone_no ?? null,
      },
      course: {
        id: booking.golfCourseId,
        name: booking.golfCourse?.name ?? null,
      },
      categoryId: booking.golferCategoryId,
      teeDate: booking.teeDate,
      teeTime: booking.teeTime.slice(0, 5),
      golfers: booking.numberOfGolfers,
      notes: booking.notes ? booking.notes.slice(0, 200) : null,
    };

    const json = JSON.stringify(data);

    // Optional tamper-proofing: staff can verify the signature server-side.
    const secret = process.env.QR_SECRET;
    const payload = secret
      ? JSON.stringify({
          ...data,
          sig: createHmac('sha256', secret)
            .update(json)
            .digest('hex')
            .slice(0, 16),
        })
      : json;

    return await QRCode.toBuffer(payload, {
      type: 'png',
      width: 640, // more data means a denser code, so render it larger
      margin: 2,
      errorCorrectionLevel: 'M',
    });
  } catch {
    return null; // send the email without the QR rather than not at all
  }
}

export async function buildBookingConfirmationEmail(
  booking: Booking,
): Promise<BuiltEmailWithAttachments> {
  const customerName = booking.customer?.name?.trim() || 'there';
  const courseName = booking.golfCourse?.name ?? 'Golf course';
  const date = formatDate(booking.teeDate);
  const time = formatTime(booking.teeTime);
  const ref = `#${booking.id}`;
  const qr = await generateQr(booking);

  const subject = `Booking ${ref} confirmed – ${courseName}, ${date}`;
  const preheader = `${courseName} on ${date} at ${time} for ${booking.numberOfGolfers} golfer(s).`;

  const sectionLabel = (label: string): string =>
    `<p style="margin:0 0 4px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:${COLORS.accent};font-weight:700;">${label}</p>`;

  const detailRow = (label: string, value: string): string => `
    <tr>
      <td style="padding:8px 0;color:${COLORS.muted};font-size:14px;width:40%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:${COLORS.text};font-size:14px;font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`;

  const notesSection = booking.notes
    ? `
        <tr><td style="padding:24px 32px 0;">
          ${sectionLabel('Your notes')}
          <p style="margin:0;font-size:14px;color:${COLORS.text};line-height:1.5;">${escapeHtml(booking.notes)}</p>
        </td></tr>`
    : '';

  const qrSection = qr
    ? `
        <tr><td align="center" style="padding:28px 32px 0;">
          ${sectionLabel('Check-in code')}
          <img src="cid:${QR_CID}" width="220" height="220" alt="Booking ${escapeHtml(ref)} QR code"
               style="display:block;margin:12px auto 0;border:1px solid ${COLORS.border};border-radius:8px;padding:8px;background:#ffffff;" />
          <p style="margin:10px 0 0;font-size:13px;line-height:1.5;color:${COLORS.muted};">
            Show this QR code at the pro shop when you arrive.<br/>
            Reference: <strong style="color:${COLORS.text};">${escapeHtml(ref)}</strong>
          </p>
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

        ${notesSection}
        ${qrSection}

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
    ...(booking.notes ? ['', `Notes: ${booking.notes}`] : []),
    '',
    `Show booking reference ${ref} at the pro shop when you arrive.`,
    `Need to change or cancel? Contact ${SUPPORT_EMAIL}.`,
    'Please arrive 30 minutes before your tee time.',
  ].join('\n');

  return {
    subject,
    html,
    text,
    attachments: qr
      ? [
          {
            filename: 'booking-qr.png',
            content: qr,
            contentType: 'image/png',
            contentId: QR_CID,
          },
        ]
      : undefined,
  };
}
