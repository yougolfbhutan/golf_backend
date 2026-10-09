import { ValueTransformer } from 'typeorm';

// Postgres NUMERIC comes back as a string; this converts it to a JS number.
export const DecimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : parseFloat(value),
};

export type Currency = 'BTN' | 'USD';
