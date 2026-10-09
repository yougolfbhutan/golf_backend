/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as decimalTransformer from 'src/modules/decimal.transformer';
import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('balls')
@Check('"quantity" >= 0')
export class Ball {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: decimalTransformer.DecimalTransformer })
  price!: number;

  @Column({ type: 'char', length: 3, default: 'BTN' })
  currency!: decimalTransformer.Currency;
}
