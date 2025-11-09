import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// เปลี่ยน IP นี้เป็น IP ของเครื่องคุณ (ดูจาก ipconfig หรือ ifconfig)
// หรือถ้าใช้ emulator: Android = 10.0.2.2, iOS = localhost
const BASE_URL = 'http://192.168.110.248:3000';  //http://10.0.2.2:3000

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: เพิ่ม token ใน header อัตโนมัติ
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: จัดการ response error
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token หมดอายุ - ลบ token และ redirect to login
      await SecureStore.deleteItemAsync('accessToken');
    }
    return Promise.reject(error);
  }
);

export default apiClient;