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
import { GolfSet } from 'src/modules/master/golf-set/entities/golf-set.entity';
import { Ball } from 'src/modules/master/ball/entities/ball.entity';
import { Booking } from './booking.entity';
import { Glove } from 'src/modules/master/gloves/entities/glove.entity';

/**
 * One rental line on a booking. Exactly one of golfSetId / gloveId / ballId
 * is set, which keeps real foreign keys instead of a loose "type + id" pair.
 */
@Entity('booking_items')
@Check('"quantity" >= 1')
@Check('"unit_price" >= 0')
@Check('num_nonnulls("golf_set_id", "glove_id", "ball_id") = 1')
export class BookingItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'booking_id', type: 'int' })
  bookingId!: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => Booking, (booking) => booking.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  @Column({ name: 'golf_set_id', type: 'int', nullable: true })
  golfSetId!: number | null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => GolfSet, { nullable: true })
  @JoinColumn({ name: 'golf_set_id' })
  golfSet!: GolfSet | null;

  @Column({ name: 'glove_id', type: 'int', nullable: true })
  gloveId!: number | null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => Glove, { nullable: true })
  @JoinColumn({ name: 'glove_id' })
  glove!: Glove | null;

  @Column({ name: 'ball_id', type: 'int', nullable: true })
  ballId!: number | null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => Ball, { nullable: true })
  @JoinColumn({ name: 'ball_id' })
  ball!: Ball | null;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  /** Price per unit at the time of booking, so later price changes don't alter old bookings. */
  @Column({
    name: 'unit_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer.DecimalTransformer,
  })
  unitPrice!: number;
}
