import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audiences')
export class Audience {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 30, unique: true })
  name!: string; // men | women | junior
}
