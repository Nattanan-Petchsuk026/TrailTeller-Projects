import apiClient from './client';

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: 'accommodation' | 'food' | 'transport' | 'activities' | 'shopping' | 'others';
  date: string;
  notes?: string;
  createdAt: string;
}

export interface CreateExpenseData {
  tripId: string;
  title: string;
  amount: number;
  category: 'accommodation' | 'food' | 'transport' | 'activities' | 'shopping' | 'others';
  date: string;
  notes?: string;
}

export interface ExpenseSummary {
  category: string;
  total: string;
}

/**
 * สร้างรายการค่าใช้จ่าย
 */
export const createExpense = async (data: CreateExpenseData) => {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: Expense;
  }>('/expenses', data);
  return response.data;
};

/**
 * ดึงรายการค่าใช้จ่ายทั้งหมดของทริป
 */
export const getExpensesByTrip = async (tripId: string) => {
  const response = await apiClient.get<{
    success: boolean;
    data: Expense[];
  }>(`/expenses/trip/${tripId}`);
  return response.data;
};

/**
 * ดึงยอดรวมค่าใช้จ่ายของทริป
 */
export const getTotalExpenses = async (tripId: string) => {
  const response = await apiClient.get<{
    success: boolean;
    data: { total: number };
  }>(`/expenses/trip/${tripId}/total`);
  return response.data;
};

/**
 * ดึงสรุปค่าใช้จ่ายแยกตามประเภท
 */
export const getExpensesSummary = async (tripId: string) => {
  const response = await apiClient.get<{
    success: boolean;
    data: ExpenseSummary[];
  }>(`/expenses/trip/${tripId}/summary`);
  return response.data;
};

/**
 * ดึงรายการค่าใช้จ่ายเดียว
 */
export const getExpense = async (id: string) => {
  const response = await apiClient.get<{
    success: boolean;
    data: Expense;
  }>(`/expenses/${id}`);
  return response.data;
};

/**
 * อัปเดตรายการค่าใช้จ่าย
 */
export const updateExpense = async (
  id: string,
  data: Partial<CreateExpenseData>
) => {
  const response = await apiClient.patch<{
    success: boolean;
    message: string;
    data: Expense;
  }>(`/expenses/${id}`, data);
  return response.data;
};

/**
 * ลบรายการค่าใช้จ่าย
 */
export const deleteExpense = async (id: string) => {
  await apiClient.delete(`/expenses/${id}`);
};