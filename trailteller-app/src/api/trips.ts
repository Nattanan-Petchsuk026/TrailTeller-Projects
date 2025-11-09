import apiClient from './client';

export interface Trip {
  id: string;
  userId: string;
  destination: string;
  country?: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  itinerary?: any;
  notes?: string;
  aiSuggestions?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripData {
  destination: string;
  country?: string;
  startDate: string;
  endDate: string;
  budget: number;
  itinerary?: any;
  notes?: string;
  aiSuggestions?: any;
  // ✅ เพิ่ม status
  status?: 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
}

/**
 * สร้างทริปใหม่
 */
export const createTrip = async (data: CreateTripData) => {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: Trip;
  }>('/trips', data);
  return response.data;
};

/**
 * ดึงทริปทั้งหมด
 */
export const getAllTrips = async () => {
  const response = await apiClient.get<{
    success: boolean;
    data: Trip[];
  }>('/trips');
  return response.data;
};

/**
 * ดึงทริปเดียว
 */
export const getTrip = async (id: string) => {
  const response = await apiClient.get<{
    success: boolean;
    data: Trip;
  }>(`/trips/${id}`);
  return response.data;
};

/**
 * อัปเดตทริป
 */
export const updateTrip = async (id: string, data: Partial<CreateTripData>) => {
  const response = await apiClient.patch<{
    success: boolean;
    message: string;
    data: Trip;
  }>(`/trips/${id}`, data);
  return response.data;
};

/**
 * ลบทริป
 */
export const deleteTrip = async (id: string) => {
  await apiClient.delete(`/trips/${id}`);
};

/**
 * นับจำนวนทริป
 */
export const countTrips = async () => {
  const response = await apiClient.get<{
    success: boolean;
    data: { count: number };
  }>('/trips/count');
  return response.data;
};

/**
 * ✅ ดึงสถิติทริป
 */
export interface TripStats {
  totalTrips: number;
  countriesVisited: number;
  completedTrips: number;
  upcomingTrips: number;
  totalBudget: number;
  favoriteDestinations: { destination: string; count: number }[];
}

/**
 * ✅ ฟังก์ชันดึงสถิติทริปจาก backend
 */
export const getTripStats = async () => {
  const response = await apiClient.get<{
    success: boolean;
    data: TripStats;
  }>('/trips/stats');
  return response.data;
};
