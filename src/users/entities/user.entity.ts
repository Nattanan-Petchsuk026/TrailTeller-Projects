import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // ซ่อน password ตอน serialize
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    interests?: string[]; // เช่น 'beach', 'mountain', 'culture'
    travelStyle?: 'budget' | 'comfort' | 'luxury';
    preferredActivities?: string[];
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relation: User มีหลาย Trip
  // @OneToMany(() => Trip, (trip) => trip.user)
  // trips: Trip[];
}
