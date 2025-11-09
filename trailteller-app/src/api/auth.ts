import apiClient from './client';
import * as SecureStore from 'expo-secure-store';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  preferences?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  preferences?: any;
}

/**
 * อัปเดตโปรไฟล์ผู้ใช้
 */
export const updateProfile = async (
  data: UpdateProfileData
): Promise<{ success: boolean; data: User }> => {
  const response = await apiClient.patch('/auth/me', data); // ✅ เปลี่ยนจาก /auth/profile เป็น /auth/me
  return response.data;
};

/**
 * ลงทะเบียน
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  
  // บันทึก token
  if (response.data.data.accessToken) {
    await SecureStore.setItemAsync('accessToken', response.data.data.accessToken);
  }
  
  return response.data;
};

/**
 * เข้าสู่ระบบ
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  
  // บันทึก token
  if (response.data.data.accessToken) {
    await SecureStore.setItemAsync('accessToken', response.data.data.accessToken);
  }
  
  return response.data;
};

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบัน
 */
export const getProfile = async (): Promise<{ success: boolean; data: User }> => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

/**
 * ออกจากระบบ
 */
export const logout = async (): Promise<void> => {
  await SecureStore.deleteItemAsync('accessToken');
};

/**
 * ตรวจสอบว่ามี token หรือไม่
 */
export const hasToken = async (): Promise<boolean> => {
  const token = await SecureStore.getItemAsync('accessToken');
  return !!token;
};
