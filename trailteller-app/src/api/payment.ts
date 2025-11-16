import apiClient from './client';

/**
 * 💳 สร้าง Payment Intent
 */
export interface CreatePaymentIntentRequest {
  bookingId: string;
  amount: number;
  metadata?: {
    tripId?: string;
    bookingIds?: string;
    itemCount?: number;
    [key: string]: any;
  };
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  data: {
    chargeId: string;
    authorizeUri: string;
  };
  message?: string;
}

export const createPaymentIntent = async (
  data: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> => {
  try {
    const response = await apiClient.post<CreatePaymentIntentResponse>(
      '/payments/create-intent',
      data
    );

    console.log('✅ Payment Intent Response:', JSON.stringify(response.data, null, 2));

    // ✅ ตรวจสอบ response structure
    if (!response.data) {
      throw new Error('ไม่ได้รับ response จาก server');
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'ไม่สามารถสร้างการชำระเงินได้');
    }

    if (!response.data.data || !response.data.data.authorizeUri) {
      console.error('❌ Invalid response structure:', response.data);
      throw new Error('รูปแบบข้อมูลจาก server ไม่ถูกต้อง');
    }

    // ✅ บังคับให้เป็น string
    return {
      success: true,
      data: {
        chargeId: String(response.data.data.chargeId || ''),
        authorizeUri: String(response.data.data.authorizeUri || ''),
      },
    };
  } catch (error: any) {
    console.error('❌ Create Payment Intent Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'ไม่สามารถสร้างการชำระเงินได้'
    );
  }
};

/**
 * ✅ ตรวจสอบสถานะการชำระเงิน
 */
export interface CheckPaymentStatusResponse {
  success: boolean;
  data: {
    status: string;
    paid: boolean;
    amount: number;
    metadata?: Record<string, any>;
  };
}

export const checkPaymentStatus = async (
  chargeId: string
): Promise<CheckPaymentStatusResponse> => {
  try {
    const response = await apiClient.get<CheckPaymentStatusResponse>(
      `/payments/status/${chargeId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Check Payment Status Error:', error);
    throw new Error(
      error.response?.data?.message || 
      'ไม่สามารถตรวจสอบสถานะการชำระเงินได้'
    );
  }
};