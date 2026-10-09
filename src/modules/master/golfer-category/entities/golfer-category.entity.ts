import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Master data: SAARC country, non-SAARC country, local (Bhutanese).
 * Prices are not stored here; they belong to the green-fee table,
 * which links a golf course to a golfer category and a currency.
 */
@Entity('golfer_categories')
export class GolferCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  /** Stable machine-readable key, e.g. SAARC, NON_SAARC, LOCAL. */

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
