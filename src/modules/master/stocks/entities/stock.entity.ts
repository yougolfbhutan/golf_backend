import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('stock')
@Check('"quantity" >= 0')
export class Stock {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'int', default: 0 })
  quantity!: number;
}
