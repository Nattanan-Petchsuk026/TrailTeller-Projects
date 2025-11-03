import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('destinations')
export class Destination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'simple-array', nullable: true })
  bestSeasons: string[]; // ['spring', 'summer', 'fall', 'winter']

  @Column({ type: 'simple-array', nullable: true })
  activities: string[]; // ['hiking', 'beach', 'culture', 'food']

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageCost: number; // ค่าใช้จ่ายเฉลี่ยต่อวัน

  @Column({ type: 'jsonb', nullable: true })
  weatherInfo: {
    month: number;
    avgTemp: number;
    rainfall: number;
    condition: string;
  }[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[]; // ['romantic', 'family-friendly', 'adventure', 'budget']

  @Column({ default: 0 })
  popularityScore: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
