import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('golf_courses')
export class GolfCourse {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'max_golfers_per_slot', type: 'smallint', default: 4 })
  maxGolfersPerSlot!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prices!: number | null;
}
