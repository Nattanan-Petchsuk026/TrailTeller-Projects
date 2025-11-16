/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Booking, BookingType, BookingStatus } from './entities/booking.entity';

export interface CreateBookingDto {
  tripId: string;
  type: BookingType;
  title: string;
  description?: string;
  price: number;
  startDate: string;
  endDate?: string;
  status?: BookingStatus;
  details?: any;
  notes?: string;
}

export interface UpdateBookingDto {
  title?: string;
  description?: string;
  price?: number;
  startDate?: string;
  endDate?: string;
  status?: BookingStatus;
  details?: any;
  notes?: string;
}

@Injectable()
export class BookingsService {
  private readonly BOOKING_API_KEY = process.env.BOOKING_API_KEY;
  private readonly BOOKING_API_HOST = 'booking-com15.p.rapidapi.com';

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  /** 🟢 สร้างการจองใหม่ - เปลี่ยนให้เป็น pending เสมอ */
async create(createBookingDto: CreateBookingDto): Promise<Booking> {
  // ✅ บังคับให้ status เป็น pending เสมอ (ไม่สนใจที่ frontend ส่งมา)
  const bookingData = {
    ...createBookingDto,
    status: BookingStatus.PENDING, // ← เปลี่ยนจากเดิม
  };

  const booking = this.bookingRepository.create(bookingData);
  return await this.bookingRepository.save(booking);
}

/** 🔄 อัปเดตสถานะการจอง (ใช้โดย PaymentService) */
async updateStatus(id: string, status: string): Promise<Booking> {
  const booking = await this.findOne(id);
  
  // ตรวจสอบว่า status ถูกต้อง
  if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
    throw new BadRequestException('สถานะไม่ถูกต้อง');
  }
  
  booking.status = status as BookingStatus;
  return await this.bookingRepository.save(booking);
}

  /** 📘 ดึงการจองทั้งหมดของทริป */
  async findAllByTrip(tripId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { tripId },
      order: { startDate: 'ASC' },
    });
  }

  /** 📗 ดึงการจองตามประเภท */
  async findByType(tripId: string, type: BookingType): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { tripId, type },
      order: { startDate: 'ASC' },
    });
  }

  /** 📙 ดึงการจองตาม ID */
  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('ไม่พบการจองนี้');
    return booking;
  }

  /** 🟡 อัปเดตการจอง */
  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);
    Object.assign(booking, updateBookingDto);
    return await this.bookingRepository.save(booking);
  }

  /** 🔴 ลบการจอง */
  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepository.remove(booking);
  }

  /** 🔢 นับจำนวนการจองของทริป */
  async countByTrip(tripId: string): Promise<number> {
    return await this.bookingRepository.count({ where: { tripId } });
  }

  /** 💰 ยอดรวมค่าจองของทริป */
  async getTotalCost(tripId: string): Promise<number> {
    const result = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('SUM(booking.price)', 'total')
      .where('booking.tripId = :tripId', { tripId })
      .getRawOne();
    return parseFloat(result?.total ?? '0');
  }

  /** 📊 สรุปการจองแยกตามประเภท */
  async getSummaryByType(tripId: string): Promise<any[]> {
    return await this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.type', 'type')
      .addSelect('COUNT(booking.id)', 'count')
      .addSelect('SUM(booking.price)', 'total')
      .where('booking.tripId = :tripId', { tripId })
      .groupBy('booking.type')
      .getRawMany();
  }

  /** 🔍 ค้นหา dest_id จากชื่อสถานที่ */
  private async searchDestination(query: string): Promise<string | null> {
    try {
      const response = await axios.get(
        'https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination',
        {
          params: { query },
          headers: {
            'X-RapidAPI-Key': this.BOOKING_API_KEY,
            'X-RapidAPI-Host': this.BOOKING_API_HOST,
          },
        },
      );
      const destinations = response.data?.data;
      if (destinations && destinations.length > 0) {
        return destinations[0].dest_id;
      }
      return null;
    } catch (error) {
      console.error('Search Destination Error:', error);
      return null;
    }
  }

  /** 🏨 ค้นหาโรงแรม (Booking.com API) */
  async searchHotels(query: {
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }): Promise<any[]> {
    try {
      const destId = await this.searchDestination(query.destination);
      if (!destId) {
        console.warn(`ไม่พบ dest_id สำหรับ: ${query.destination}`);
        return this.getMockHotels(query.destination);
      }

      const response = await axios.get(
        'https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels',
        {
          params: {
            dest_id: destId,
            search_type: 'CITY',
            arrival_date: query.checkIn,
            departure_date: query.checkOut,
            adults: query.guests,
            room_qty: 1,
            units: 'metric',
            temperature_unit: 'c',
            languagecode: 'th',
            currency_code: 'THB',
          },
          headers: {
            'X-RapidAPI-Key': this.BOOKING_API_KEY,
            'X-RapidAPI-Host': this.BOOKING_API_HOST,
          },
          timeout: 10000,
        },
      );

      const hotels = response.data?.data?.hotels || [];
      return hotels.map((hotel: any) => ({
        id: hotel.hotel_id?.toString(),
        name: hotel.property?.name || hotel.accessibilityLabel || 'Unknown Hotel',
        location: query.destination,
        rating: hotel.property?.reviewScore || hotel.review_score || 0,
        price: hotel.property?.priceBreakdown?.grossPrice?.value || hotel.min_total_price || 0,
        currency: 'THB',
        imageUrl:
          hotel.property?.photoUrls?.[0] || hotel.main_photo_url || 'https://via.placeholder.com/400x300?text=No+Image',
        amenities: hotel.property?.checkinCheckoutTimes?.checkout || [],
        roomType: 'Standard Room',
        description: hotel.property?.reviewScoreWord || hotel.review_score_word || 'ไม่มีรีวิว',
        address: hotel.property?.address || '',
        checkIn: hotel.property?.checkinCheckoutTimes?.checkin || '',
        checkOut: hotel.property?.checkinCheckoutTimes?.checkout || '',
      }));
    } catch (error) {
      console.error('Booking API Error:', error.response?.data || error.message);
      return this.getMockHotels(query.destination);
    }
  }

  async searchRestaurants(query: {
    destination: string;
    date: string;
    partySize: number;
    cuisine?: string;
  }): Promise<any[]> {
    try {
      // 1️⃣ แปลงชื่อเมือง → location_id
      const locRes = await axios.get('https://travel-advisor.p.rapidapi.com/locations/search', {
        params: { query: query.destination },
        headers: {
          'X-RapidAPI-Key': process.env.TRIPADVISOR_API_KEY,
          'X-RapidAPI-Host': process.env.TRIPADVISOR_API_HOST,
        },
      });

      const locationId = locRes.data.data?.[0]?.result_object?.location_id;
      if (!locationId) {
        console.warn('ไม่พบ location_id สำหรับ:', query.destination);
        return this.getMockRestaurants(query.destination);
      }

      // 2️⃣ เรียก Restaurants API ด้วย location_id
      const response = await axios.get('https://travel-advisor.p.rapidapi.com/restaurants/list', {
        params: {
          location_id: locationId,
          // cuisine: query.cuisine,
          limit: 30,
          lunit: 'km',
          currency: 'THB',
        },
        headers: {
          'X-RapidAPI-Key': process.env.TRIPADVISOR_API_KEY,
          'X-RapidAPI-Host': process.env.TRIPADVISOR_API_HOST,
        },
      });

      const restaurants = response.data.data || [];

      // 3️⃣ แปลงข้อมูลให้ frontend ใช้งานได้
      return restaurants.map((r: any) => ({
        id: r.location_id?.toString() || String(r.id),
        name: r.name || 'Unknown Restaurant',
        cuisine: query.cuisine || r.cuisine || 'Various',
        location: `${r.address || ''}, ${r.city || query.destination}`,
        rating: r.rating || 0,
        priceRange: r.price_level || 'N/A',
        imageUrl: r.photo?.images?.large?.url || 'https://via.placeholder.com/400x300?text=No+Image',
        description: r.description || '',
        phoneNumber: r.phone || 'N/A',
        openingHours: r.opening_hours || 'N/A',
      }));
    } catch (error) {
      console.error('TripAdvisor API Error:', error.response?.data || error.message);
      return this.getMockRestaurants(query.destination);
    }
  }

async searchFlights(query: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  seatClass?: string;
}): Promise<any[]> {
  try {
    console.log('🔍 Searching flights with params:', query);
    
    const response = await axios.get(
      'https://kiwi-com-cheap-flights.p.rapidapi.com/round-trip',
      {
        params: {
          source: query.origin,
          destination: query.destination,
          departDate: query.departureDate,
          returnDate: query.returnDate,
          currency: 'THB',
          locale: 'en',
          adults: query.passengers,
          cabinClass: query.seatClass?.toUpperCase() || 'ECONOMY',
          sortBy: 'QUALITY',
          sortOrder: 'ASCENDING',
          limit: 10,
        },
        headers: {
          'X-RapidAPI-Key': process.env.KIWI_API_KEY,
          'X-RapidAPI-Host': 'kiwi-com-cheap-flights.p.rapidapi.com',
        },
        timeout: 15000,
      },
    );

    console.log('📡 API Response keys:', Object.keys(response.data || {}));

    let flights: any[] = [];

    // ✅ NEW: ลองดึงจาก itineraries ก่อน
    if (response.data?.itineraries) {
      flights = response.data.itineraries;
      console.log('✅ Found flights in itineraries:', flights.length);
    }
    // เก็บไว้เผื่อ version เก่า
    else if (response.data?.topResults) {
      const topResults = response.data.topResults;
      flights = topResults.cheap || topResults.best || topResults.quick || [];
      console.log('✅ Found flights in topResults:', flights.length);
    }
    else if (response.data?.data) {
      flights = response.data.data;
    }
    else if (Array.isArray(response.data)) {
      flights = response.data;
    }

    if (!flights || flights.length === 0) {
      console.warn('⚠️ No flights found');
      return this.getMockFlights(query.origin, query.destination);
    }

    console.log(`✅ Processing ${flights.length} flights`);

    // ✅ แปลงข้อมูลตาม structure ใหม่
    return flights.slice(0, 10).map((f: any) => {
      // ดึงข้อมูลจาก outbound (เที่ยวไป) และ inbound (เที่ยวกลับ)
      const outbound = f.outbound?.sectorSegments?.[0]?.segment;
      const inbound = f.inbound?.sectorSegments?.[0]?.segment;
      
      return {
        id: f.id || f.legacyId || `flight-${Math.random()}`,
        airline: outbound?.carrier?.name || 'Unknown Airline',
        flightNumber: outbound?.code || 'N/A',
        departureAirport: outbound?.source?.station?.code || query.origin,
        arrivalAirport: outbound?.destination?.station?.code || query.destination,
        departureTime: outbound?.source?.localTime || query.departureDate,
        arrivalTime: outbound?.destination?.localTime || '',
        duration: `${Math.floor((f.duration || 0) / 3600)}h ${Math.floor(((f.duration || 0) % 3600) / 60)}m`,
        price: parseFloat(f.price?.amount || '0'),
        currency: 'THB',
        seatClass: f.provider?.name || query.seatClass || 'Economy',
        availableSeats: 50, // API ไม่ได้ให้ข้อมูลนี้
        bookingUrl: f.bookingOptions?.edges?.[0]?.node?.bookingUrl,
        returnFlight: inbound ? {
          flightNumber: inbound.code,
          departureTime: inbound.source?.localTime,
          arrivalTime: inbound.destination?.localTime,
        } : null,
      };
    });

  } catch (error) {
    console.error('❌ Kiwi.com API Error:', error.message);
    return this.getMockFlights(query.origin, query.destination);
  }
}

  /** 🧩 Mock Hotels */
  private getMockHotels(destination: string): any[] {
    return [
      {
        id: 'mock-hotel-1',
        name: `โรงแรมตัวอย่าง 1 (${destination})`,
        location: destination,
        rating: 8.5,
        price: 2500,
        currency: 'THB',
        imageUrl: 'https://via.placeholder.com/400x300?text=Mock+Hotel+1',
        amenities: ['Free WiFi', 'Breakfast Included', 'Pool'],
        roomType: 'Deluxe Room',
        description: 'ห้องพักสะอาด บรรยากาศดี',
        address: `123 Main Street, ${destination}`,
        checkIn: '14:00',
        checkOut: '12:00',
      },
      {
        id: 'mock-hotel-2',
        name: `โรงแรมตัวอย่าง 2 (${destination})`,
        location: destination,
        rating: 9.0,
        price: 3500,
        currency: 'THB',
        imageUrl: 'https://via.placeholder.com/400x300?text=Mock+Hotel+2',
        amenities: ['Free WiFi', 'Breakfast', 'Gym', 'Spa'],
        roomType: 'Suite Room',
        description: 'หรูหรา วิวสวย',
        address: `456 Beach Road, ${destination}`,
        checkIn: '15:00',
        checkOut: '11:00',
      },
    ];
  }

  /** 🧩 Mock Restaurants */
  private getMockRestaurants(destination: string): any[] {
    return [
      {
        id: 'mock-rest-1',
        name: `ร้านอาหารไทย ${destination}`,
        cuisine: 'Thai',
        location: destination,
        rating: 4.5,
        priceRange: '฿฿',
        imageUrl: 'https://via.placeholder.com/400x300?text=Thai+Restaurant',
        description: 'อาหารไทยรสชาติดั้งเดิม บรรยากาศดี',
        phoneNumber: '02-123-4567',
        openingHours: '11:00 - 22:00',
      },
      {
        id: 'mock-rest-2',
        name: `ร้านซีฟู้ด ${destination}`,
        cuisine: 'Seafood',
        location: destination,
        rating: 4.8,
        priceRange: '฿฿฿',
        imageUrl: 'https://via.placeholder.com/400x300?text=Seafood+Restaurant',
        description: 'ซีฟู้ดสดใหม่ ทะเลสวยๆ',
        phoneNumber: '02-234-5678',
        openingHours: '10:00 - 23:00',
      },
      {
        id: 'mock-rest-3',
        name: `ร้านอาหารอิตาเลียน ${destination}`,
        cuisine: 'Italian',
        location: destination,
        rating: 4.6,
        priceRange: '฿฿฿',
        imageUrl: 'https://via.placeholder.com/400x300?text=Italian+Restaurant',
        description: 'พิซซ่า พาสต้า รสชาติเยี่ยม',
        phoneNumber: '02-345-6789',
        openingHours: '12:00 - 23:00',
      },
    ];
  }

  /** 🧩 Mock Flights */
  private getMockFlights(origin: string, destination: string): any[] {
    return [
      {
        id: 'mock-flight-1',
        airline: 'Thai Airways',
        flightNumber: 'TG301',
        departureAirport: origin,
        arrivalAirport: destination,
        departureTime: '08:00',
        arrivalTime: '10:30',
        duration: '2h 30m',
        price: 3500,
        currency: 'THB',
        seatClass: 'Economy',
        availableSeats: 45,
      },
      {
        id: 'mock-flight-2',
        airline: 'Bangkok Airways',
        flightNumber: 'PG205',
        departureAirport: origin,
        arrivalAirport: destination,
        departureTime: '13:45',
        arrivalTime: '16:15',
        duration: '2h 30m',
        price: 4200,
        currency: 'THB',
        seatClass: 'Economy',
        availableSeats: 28,
      },
      {
        id: 'mock-flight-3',
        airline: 'Thai Smile',
        flightNumber: 'WE123',
        departureAirport: origin,
        arrivalAirport: destination,
        departureTime: '18:30',
        arrivalTime: '21:00',
        duration: '2h 30m',
        price: 2900,
        currency: 'THB',
        seatClass: 'Economy',
        availableSeats: 62,
      },
    ];
  }
}