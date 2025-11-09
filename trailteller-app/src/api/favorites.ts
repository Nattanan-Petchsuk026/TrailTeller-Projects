import apiClient from './client';

export interface Favorite {
  id: string;
  userId: string;
  destination: string;
  country?: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  aiSuggestions?: {
    bestTime?: string;
    estimatedBudget?: number;
    duration?: number;
    highlights?: string[];
  };
  createdAt: string;
}

export interface CreateFavoriteData {
  destination: string;
  country?: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  aiSuggestions?: any;
}

/**
 * เพิ่มสถานที่โปรด
 */
export const addFavorite = async (data: CreateFavoriteData) => {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: Favorite;
  }>('/favorites', data);
  return response.data;
};

/**
 * ดึงสถานที่โปรดทั้งหมด
 */
export const getAllFavorites = async () => {
  const response = await apiClient.get<{
    success: boolean;
    data: Favorite[];
  }>('/favorites');
  return response.data;
};

/**
 * ดึงสถานที่โปรดเดียว
 */
export const getFavorite = async (id: string) => {
  const response = await apiClient.get<{
    success: boolean;
    data: Favorite;
  }>(`/favorites/${id}`);
  return response.data;
};

/**
 * ลบสถานที่โปรด
 */
export const deleteFavorite = async (id: string) => {
  await apiClient.delete(`/favorites/${id}`);
};

/**
 * นับจำนวนสถานที่โปรด
 */
export const countFavorites = async () => {
  const response = await apiClient.get<{
    success: boolean;
    data: { count: number };
  }>('/favorites/count');
  return response.data;
};

/**
 * ตรวจสอบว่ามีในโปรดแล้วหรือยัง
 */
export const checkFavoriteExists = async (destination: string) => {
  const response = await apiClient.get<{
    success: boolean;
    data: { exists: boolean };
  }>(`/favorites/check/${encodeURIComponent(destination)}`);
  return response.data;
};