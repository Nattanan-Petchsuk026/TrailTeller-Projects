import apiClient from './client';

/**
 *  รายละเอียดการจองแต่ละประเภท
 */
export interface HotelDetails {
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
}

export interface FlightReturnInfo {
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
}

export interface FlightDetails {
  flightNumber?: string;
  airline?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string; 
  seatClass?: string;
  passengers?: number;
  bookingUrl?: string; 
  returnFlight?: FlightReturnInfo;
}

export interface RestaurantDetails {
  restaurantName?: string;
  reservationDate?: string;
  reservationTime?: string;
  partySize?: number;
  cuisine?: string;
  location?: string;
  phoneNumber?: string;
  rating?: number;
  priceRange?: string;
  imageUrl?: string;
  openingHours?: string;
  description?: string;
}

export interface ActivityDetails {
  activityName?: string;
  location?: string;
  duration?: string;
  participants?: number;
}

/**
 *  Interface สำหรับ Booking
 */
export interface Booking {
  id: string;
  tripId: string;
  type: 'hotel' | 'flight' | 'restaurant' | 'activity';
  title: string;
  description?: string;
  price: number;
  startDate: string;
  endDate?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  details?: HotelDetails | FlightDetails | RestaurantDetails | ActivityDetails;
  notes?: string;
  createdAt: string;
}

/**
 *  Interface สำหรับสร้าง Booking ใหม่
 */
export interface CreateBookingData {
  tripId: string;
  type: 'hotel' | 'flight' | 'restaurant' | 'activity';
  title: string;
  description?: string;
  price: number;
  startDate: string;
  endDate?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  details?: HotelDetails | FlightDetails | RestaurantDetails | ActivityDetails;
  notes?: string;
}

/**
 *  Interface สำหรับโรงแรม
 */
export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  currency: string;
  imageUrl: string;
  amenities: string[];
  roomType: string;
  description: string;
  address: string;
  checkIn: string;
  checkOut: string;
}

export interface HotelSearchQuery {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

/**
 *  Interface สำหรับร้านอาหาร
 */
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  priceRange: string;
  imageUrl: string;
  description: string;
  phoneNumber: string;
  openingHours: string;
}

export interface RestaurantSearchQuery {
  destination: string;
  date: string;
  partySize: number;
  cuisine?: string;
}

/**
 *  Interface สำหรับเที่ยวบิน
 */
export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  seatClass: string;
  availableSeats: number;
}

export interface FlightSearchQuery {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  seatClass?: 'economy' | 'business' | 'first';
}

/**
 *  ค้นหาโรงแรม
 */
export const searchHotels = async (query: HotelSearchQuery) => {
  const response = await apiClient.get<{ success: boolean; data: Hotel[] }>(
    '/bookings/search/hotels',
    { params: query }
  );
  return response.data;
};

/**
 *  ค้นหาร้านอาหาร
 */
export const searchRestaurants = async (query: RestaurantSearchQuery) => {
  const response = await apiClient.get<{ success: boolean; data: Restaurant[] }>(
    '/bookings/search/restaurants',
    { params: query }
  );
  return response.data;
};

/**
 *  ค้นหาเที่ยวบิน
 */
export const searchFlights = async (query: FlightSearchQuery) => {
  const response = await apiClient.get<{ success: boolean; data: Flight[] }>(
    '/bookings/search/flights',
    { params: query }
  );
  return response.data;
};

/**
 *  สร้างการจองใหม่
 */
export const createBooking = async (data: CreateBookingData) => {
  const response = await apiClient.post<{ success: boolean; message: string; data: Booking }>(
    '/bookings',
    data
  );
  return response.data;
};

/**
 *  ดึงการจองทั้งหมดของทริป
 */
export const getBookingsByTrip = async (tripId: string) => {
  const response = await apiClient.get<{ success: boolean; data: Booking[] }>(
    `/bookings/trip/${tripId}`
  );
  return response.data;
};

/**
 *  ดึงการจองเดียว
 */
export const getBooking = async (id: string) => {
  const response = await apiClient.get<{ success: boolean; data: Booking }>(
    `/bookings/${id}`
  );
  return response.data;
};

/**
 *  อัปเดตการจอง
 */
export const updateBooking = async (id: string, data: Partial<CreateBookingData>) => {
  const response = await apiClient.patch<{ success: boolean; message: string; data: Booking }>(
    `/bookings/${id}`,
    data
  );
  return response.data;
};

/**
 *  ลบการจอง
 */
export const deleteBooking = async (id: string) => {
  await apiClient.delete(`/bookings/${id}`);
};

/**
 * 📊 ยอดรวมค่าจองของทริป
 */
export const getTotalBookingCost = async (tripId: string) => {
  const response = await apiClient.get<{ success: boolean; data: { total: number } }>(
    `/bookings/trip/${tripId}/total`
  );
  return response.data;
};

/**
 *  สรุปการจองแยกตามประเภท
 */
export const getBookingSummary = async (tripId: string) => {
  const response = await apiClient.get<{
    success: boolean;
    data: Array<{ type: string; count: string; total: string }>;
  }>(`/bookings/trip/${tripId}/summary`);
  return response.data;
};

/**
 *  ดึงการจองโรงแรมเท่านั้น
 */
export const getHotelBookings = async (tripId: string) => {
  const response = await apiClient.get<{ success: boolean; data: Booking[] }>(
    `/bookings/trip/${tripId}/type/hotel`
  );
  return response.data;
};

/**
 *  ดึงการจองเที่ยวบินเท่านั้น
 */
export const getFlightBookings = async (tripId: string) => {
  const response = await apiClient.get<{ success: boolean; data: Booking[] }>(
    `/bookings/trip/${tripId}/type/flight`
  );
  return response.data;
};

/**
 *  ดึงการจองร้านอาหารเท่านั้น
 */
export const getRestaurantBookings = async (tripId: string) => {
  const response = await apiClient.get<{ success: boolean; data: Booking[] }>(
    `/bookings/trip/${tripId}/type/restaurant`
  );
  return response.data;
};

/**
 *  ดึงการจองกิจกรรมเท่านั้น
 */
export const getActivityBookings = async (tripId: string) => {
  const response = await apiClient.get<{ success: boolean; data: Booking[] }>(
    `/bookings/trip/${tripId}/type/activity`
  );
  return response.data;
};
