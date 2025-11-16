import { Repository } from 'typeorm';
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
export declare class BookingsService {
    private readonly bookingRepository;
    private readonly BOOKING_API_KEY;
    private readonly BOOKING_API_HOST;
    constructor(bookingRepository: Repository<Booking>);
    create(createBookingDto: CreateBookingDto): Promise<Booking>;
    updateStatus(id: string, status: string): Promise<Booking>;
    findAllByTrip(tripId: string): Promise<Booking[]>;
    findByType(tripId: string, type: BookingType): Promise<Booking[]>;
    findOne(id: string): Promise<Booking>;
    update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking>;
    remove(id: string): Promise<void>;
    countByTrip(tripId: string): Promise<number>;
    getTotalCost(tripId: string): Promise<number>;
    getSummaryByType(tripId: string): Promise<any[]>;
    private searchDestination;
    searchHotels(query: {
        destination: string;
        checkIn: string;
        checkOut: string;
        guests: number;
    }): Promise<any[]>;
    searchRestaurants(query: {
        destination: string;
        date: string;
        partySize: number;
        cuisine?: string;
    }): Promise<any[]>;
    searchFlights(query: {
        origin: string;
        destination: string;
        departureDate: string;
        returnDate?: string;
        passengers: number;
        seatClass?: string;
    }): Promise<any[]>;
    private getMockHotels;
    private getMockRestaurants;
    private getMockFlights;
}
