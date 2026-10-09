/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
//   ManyToMany,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
// import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string; // e.g. "create_user"

  @Column({ nullable: true })
  description!: string;

  // 🔗 Many permissions belong to many roles
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];
}