/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Booking } from "../booking/entities/booking.entity";

export const BRAND = 'Bhutan Golf';
export const SUPPORT_EMAIL = 'yougolfbhutan@gmail.com';

export const COLORS = {
  bg: '#f3f5f3',
  card: '#ffffff',
  primary: '#1f5a3d',
  accent: '#c9a44c',
  text: '#1f2933',
  muted: '#6b7780',
  border: '#e3e8e5',
};

export const escapeHtml = (s: string): string =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );

export const money = (currency: string, amount: number): string =>
  `${currency} ${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDate = (teeDate: string): string => {
  const d = new Date(`${teeDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return teeDate;
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

export const formatTime = (teeTime: string): string => teeTime.slice(0, 5);

export const itemName = (i: Booking['items'][number]): string =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  i.golfSet?.name ?? i.glove?.name ?? i.ball?.name ?? 'Rental item';

export interface BuiltEmail {
  subject: string;
  html: string;
  text: string;
}
