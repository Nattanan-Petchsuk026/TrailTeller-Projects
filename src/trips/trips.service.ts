import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip, TripStatus } from './entities/trip.entity';

export interface CreateTripDto {
  userId: string;
  destination: string;
  country?: string;
  startDate: string;
  endDate: string;
  budget: number;
  itinerary?: any;
  notes?: string;
  aiSuggestions?: any;
}

export interface UpdateTripDto {
  destination?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: TripStatus;
  itinerary?: any;
  notes?: string;
  aiSuggestions?: any;
}

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
  ) {}

  /**
   * สร้างทริปใหม่
   */
  async create(createTripDto: CreateTripDto): Promise<Trip> {
    const trip = this.tripRepository.create(createTripDto);
    return await this.tripRepository.save(trip);
  }

  /**
   * ดึงทริปทั้งหมดของ user
   */
  async findAllByUser(userId: string): Promise<Trip[]> {
    return await this.tripRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * ดึงทริปตาม ID
   */
  async findOne(id: string, userId: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id, userId },
    });

    if (!trip) {
      throw new NotFoundException('ไม่พบทริปนี้');
    }

    return trip;
  }

  /**
   * อัปเดตทริป
   */
  async update(
    id: string,
    userId: string,
    updateTripDto: UpdateTripDto,
  ): Promise<Trip> {
    const trip = await this.findOne(id, userId);
    Object.assign(trip, updateTripDto);
    return await this.tripRepository.save(trip);
  }

  /**
   * ลบทริป
   */
  async remove(id: string, userId: string): Promise<void> {
    const trip = await this.findOne(id, userId);
    await this.tripRepository.remove(trip);
  }

  /**
   * ดึงทริปตาม status
   */
  async findByStatus(userId: string, status: TripStatus): Promise<Trip[]> {
    return await this.tripRepository.find({
      where: { userId, status },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * นับจำนวนทริปของ user
   */
  async countByUser(userId: string): Promise<number> {
    return await this.tripRepository.count({
      where: { userId },
    });
  }

  /**
   * ดึงสถิติทริป
   */
  async getStats(userId: string): Promise<{
    totalTrips: number;
    countriesVisited: number;
    completedTrips: number;
    upcomingTrips: number;
    totalBudget: number;
    favoriteDestinations: { destination: string; count: number }[];
  }> {
    const trips = await this.tripRepository.find({
      where: { userId },
    });

    // นับประเทศที่ไม่ซ้ำ
    const uniqueCountries = new Set(
      trips.filter((t) => t.country).map((t) => t.country),
    );

    // นับทริปที่เสร็จสิ้น
    const completedTrips = trips.filter(
      (t) => t.status === TripStatus.COMPLETED,
    ).length;

    // นับทริปที่กำลังจะมาถึง (confirmed หรือ in_progress)
    const upcomingTrips = trips.filter(
      (t) =>
        t.status === TripStatus.CONFIRMED ||
        t.status === TripStatus.IN_PROGRESS,
    ).length;

    // รวมงบประมาณทั้งหมด
    const totalBudget = trips.reduce(
      (sum, trip) => sum + Number(trip.budget),
      0,
    );

    // หาจุดหมายที่ไปบ่อยที่สุด
    const destinationCount = trips.reduce(
      (acc, trip) => {
        acc[trip.destination] = (acc[trip.destination] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const favoriteDestinations = Object.entries(destinationCount)
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // เอา 3 อันดับแรก

    return {
      totalTrips: trips.length,
      countriesVisited: uniqueCountries.size,
      completedTrips,
      upcomingTrips,
      totalBudget,
      favoriteDestinations,
    };
  }
}
