import { BookingsService } from './bookings.service';
import type { CreateBookingDto, UpdateBookingDto } from './bookings.service';
import { BookingType } from './entities/booking.entity';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/booking.entity").Booking;
    }>;
    findAllByTrip(tripId: string): Promise<{
        success: boolean;
        data: import("./entities/booking.entity").Booking[];
    }>;
    findByType(tripId: string, type: BookingType): Promise<{
        success: boolean;
        data: import("./entities/booking.entity").Booking[];
    }>;
    getTotalCost(tripId: string): Promise<{
        success: boolean;
        data: {
            total: number;
        };
    }>;
    getSummary(tripId: string): Promise<{
        success: boolean;
        data: any[];
    }>;
    searchHotels(destination: string, checkIn: string, checkOut: string, guests: number): Promise<{
        success: boolean;
        data: any[];
    }>;
    searchRestaurants(destination: string, date: string, partySize: number, cuisine?: string): Promise<{
        success: boolean;
        data: any[];
    }>;
    searchFlights(origin: string, destination: string, departureDate: string, returnDate?: string, passengers?: number, seatClass?: string): Promise<{
        success: boolean;
        data: any[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("./entities/booking.entity").Booking;
    }>;
    update(id: string, updateBookingDto: UpdateBookingDto): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/booking.entity").Booking;
    }>;
    remove(id: string): Promise<void>;
}
