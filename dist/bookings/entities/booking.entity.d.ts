import { Trip } from '../../trips/entities/trip.entity';
export declare enum BookingType {
    HOTEL = "hotel",
    FLIGHT = "flight",
    RESTAURANT = "restaurant",
    ACTIVITY = "activity"
}
export declare enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}
export declare class Booking {
    id: string;
    tripId: string;
    type: BookingType;
    title: string;
    description: string;
    price: number;
    startDate: Date;
    endDate: Date;
    status: BookingStatus;
    details: {
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
        flightNumber?: string;
        airline?: string;
        departureAirport?: string;
        arrivalAirport?: string;
        departureTime?: string;
        arrivalTime?: string;
        seatClass?: string;
        passengers?: number;
        restaurantName?: string;
        reservationDate?: string;
        reservationTime?: string;
        partySize?: number;
        cuisine?: string;
        location?: string;
        phoneNumber?: string;
        activityName?: string;
        duration?: string;
        participants?: number;
        confirmationNumber?: string;
        providerUrl?: string;
        cancellationPolicy?: string;
    };
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    trip: Trip;
}
