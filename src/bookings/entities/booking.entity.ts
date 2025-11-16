import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Trip } from '../../trips/entities/trip.entity';

export enum BookingType {
  HOTEL = 'hotel',
  FLIGHT = 'flight',
  RESTAURANT = 'restaurant', // ✅ เพิ่ม restaurant
  ACTIVITY = 'activity',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tripId: string;

  @Column({ type: 'enum', enum: BookingType })
  type: BookingType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'jsonb', nullable: true })
  details: {
    // ✅ สำหรับโรงแรม
    hotelName?: string;
    roomType?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    nights?: number;
    address?: string;
    rating?: number;
    imageUrl?: string;
    amenities?: string[];

    // ✅ สำหรับเที่ยวบิน
    flightNumber?: string;
    airline?: string;
    departureAirport?: string;
    arrivalAirport?: string;
    departureTime?: string;
    arrivalTime?: string;
    seatClass?: string;
    passengers?: number;

    // ✅ สำหรับร้านอาหาร
    restaurantName?: string;
    reservationDate?: string;
    reservationTime?: string;
    partySize?: number;
    cuisine?: string;
    location?: string;
    phoneNumber?: string;

    // ✅ สำหรับกิจกรรม
    activityName?: string;
    duration?: string;
    participants?: number;

    // ข้อมูลทั่วไป
    confirmationNumber?: string;
    providerUrl?: string;
    cancellationPolicy?: string;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;
}
