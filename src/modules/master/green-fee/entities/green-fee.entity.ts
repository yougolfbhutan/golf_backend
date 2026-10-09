/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import * as decimalTransformer from 'src/modules/decimal.transformer';
import { GolferCategory } from 'src/modules/master/golfer-category/entities/golfer-category.entity';
import { GolfCourse } from '../../course/entities/course.entity';

/**
 * Price per golfer for one golf course and one golfer category (SAARC,
 * non-SAARC, local) in one currency. A course can have the same category
 * priced in both BTN and USD, but only once per currency.
 */
@Entity('green_fees')
@Unique(['golfCourseId', 'golferCategoryId', 'currency'])
@Check('"amount" >= 0')
export class GreenFee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'golf_course_id', type: 'int' })
  golfCourseId!: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => GolfCourse, { nullable: false })
  @JoinColumn({ name: 'golf_course_id' })
  golfCourse!: GolfCourse;

  @Column({ name: 'golfer_category_id', type: 'int' })
  golferCategoryId!: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => GolferCategory, { nullable: false })
  @JoinColumn({ name: 'golfer_category_id' })
  golferCategory!: GolferCategory;

  /** Fee per golfer. */
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer.DecimalTransformer,
  })
  amount!: number;

  @Column({ type: 'char', length: 3, default: 'BTN' })
  currency!: decimalTransformer.Currency;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
