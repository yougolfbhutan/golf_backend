/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as decimalTransformer from 'src/modules/decimal.transformer';
import { User } from 'src/modules/access_management/user/entities/user.entity';
import { GolfCourse } from 'src/modules/master/course/entities/course.entity';
import { GolferCategory } from 'src/modules/master/golfer-category/entities/golfer-category.entity';
import { BookingItem } from './booking item.entity';
// import { Customer } from 'src/modules/access-management/customer/entities/customer.entity';
// import { GolfCourse } from 'src/modules/master/golf-course/entities/golf-course.entity';
// import { GolferCategory } from 'src/modules/master/golfer-category/entities/golfer-category.entity';
// import { BookingItem } from './booking-item.entity';

export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

@Entity('bookings')
@Check('"number_of_golfers" >= 1')
@Check('"total_amount" >= 0')
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customerId!: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer!: User;

  @Column({ name: 'golf_course_id', type: 'int' })
  golfCourseId!: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => GolfCourse, { nullable: false })
  @JoinColumn({ name: 'golf_course_id' })
  golfCourse!: GolfCourse;

  /** SAARC / non-SAARC / local, from master data. */
  @Column({ name: 'golfer_category_id', type: 'int' })
  golferCategoryId!: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => GolferCategory, { nullable: false })
  @JoinColumn({ name: 'golfer_category_id' })
  golferCategory!: GolferCategory;

  /** YYYY-MM-DD */
  @Column({ name: 'tee_date', type: 'date' })
  teeDate!: string;

  /** HH:MM:SS */
  @Column({ name: 'tee_time', type: 'time' })
  teeTime!: string;

  @Column({ name: 'number_of_golfers', type: 'int' })
  numberOfGolfers!: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: BookingStatus;

  @Column({
    name: 'total_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer.DecimalTransformer,
  })
  totalAmount!: number;

  @Column({ type: 'char', length: 3, default: 'BTN' })
  currency!: decimalTransformer.Currency;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToMany(() => BookingItem, (item) => item.booking, {
    cascade: ['insert'],
  })
  items!: BookingItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
