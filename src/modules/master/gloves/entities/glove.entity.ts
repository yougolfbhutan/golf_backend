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
import { Audience } from '../../audience/entities/audience.entity';

@Entity('gloves')
@Check('"quantity" >= 0')
export class Glove {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ name: 'audience_id', type: 'int', nullable: true })
  audienceId!: number | null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => Audience, { nullable: true })
  @JoinColumn({ name: 'audience_id' })
  audience!: Audience | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  size!: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  handedness!: 'left' | 'right' | null;

  @Column({ name: 'is_available', default: true })
  isAvailable!: boolean;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: decimalTransformer.DecimalTransformer,
  })
  price!: number;

  @Column({ type: 'char', length: 3, default: 'BTN' })
  currency!: decimalTransformer.Currency;
}
