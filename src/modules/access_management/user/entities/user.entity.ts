/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    JoinTable,
    ManyToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Permission } from '../../permissions/entities/permission.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ unique: true })
    phone_no!: string;

    @Column({ unique: true })
    identification_no!: string;

    @Column()
    @Exclude() // 🔐 hide from API response
    password!: string;

    @Column({ default: true })
    is_active!: boolean;

    @Column({ default: false })
    is_verified!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    last_login!: Date;

    @Column({ nullable: true })
    refresh_token!: string; // 🔐 for JWT refresh

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @DeleteDateColumn()
    deleted_at!: Date; // ✅ soft delete

    @ManyToMany(() => Role, { eager: true })
    @JoinTable()
    roles!: Role[];

    @ManyToMany(() => Permission, { eager: true })
    @JoinTable()
    permissions!: Permission[];
}