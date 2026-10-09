/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as decimalTransformer from 'src/modules/decimal.transformer';
import { Audience } from 'src/modules/master/audience/entities/audience.entity';

@Entity('golf_sets')
@Check('"quantity" >= 0')
@Check('"price" >= 0')
export class GolfSet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  /** Men, women or junior. */
  @Column({ name: 'audience_id', type: 'int', nullable: true })
  audienceId!: number | null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => Audience, { nullable: true })
  @JoinColumn({ name: 'audience_id' })
  audience!: Audience | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  handedness!: 'left' | 'right' | null;

  @Column({ name: 'is_available', default: true })
  isAvailable!: boolean;

  /** Cloudinary URL. */
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl!: string | null;

  /** Number of sets owned. */
  @Column({ type: 'int', default: 0 })
  quantity!: number;

  /** Rental price per booking. */
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: decimalTransformer.DecimalTransformer,
  })
  price!: number;
}
