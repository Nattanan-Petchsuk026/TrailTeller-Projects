import apiClient from './client';

/** ------------------------- */
/** Request Interfaces       */
/** ------------------------- */
export interface SuggestDestinationsRequest {
  budget: number;
  interests: string[];
  travelStyle: string;
  duration: number;
  preferredSeason?: string;
}

export interface GenerateItineraryRequest {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  interests: string[];
}

export interface ChatRequest {
  message: string;
  context?: string;
}

/** ------------------------- */
/** Response Interfaces      */
/** ------------------------- */
export interface AIResponse {
  success: boolean;
  data: {
    suggestion?: string;
    itinerary?: string;
    response?: string;
    recommendation?: string;
  };
}

export interface Destination {
  name: string;
  country: string;
  description: string;
  tags: string[];
  bestTime: string;
  estimatedBudget: number;
  highlights: string[];
  activities: string[];
}

export interface SearchResponse {
  success: boolean;
  data: {
    results: Destination[];
    query: string;
  };
}

/** ------------------------- */
/** AI API Functions         */
/** ------------------------- */

/** แนะนำจุดหมายปลายทาง */
export const suggestDestinations = async (
  data: SuggestDestinationsRequest
): Promise<AIResponse> => {
  const response = await apiClient.post<AIResponse>(
    '/ai/suggest-destinations',
    data
  );
  return response.data;
};

/** สร้างแผนการเดินทาง */
export const generateItinerary = async (
  data: GenerateItineraryRequest
): Promise<AIResponse> => {
  const response = await apiClient.post<AIResponse>(
    '/ai/generate-itinerary',
    data
  );
  return response.data;
};

/** แนะนำช่วงเวลาที่ดีที่สุด */
export const getBestTravelTime = async (
  destination: string
): Promise<AIResponse> => {
  const response = await apiClient.post<AIResponse>('/ai/best-travel-time', {
    destination,
  });
  return response.data;
};

/** Chat กับ AI Assistant */
export const chatWithAI = async (data: ChatRequest): Promise<AIResponse> => {
  const response = await apiClient.post<AIResponse>('/ai/chat', data);
  return response.data;
};

/** ค้นหาสถานที่ท่องเที่ยว */
export const searchDestinations = async (
  query: string
): Promise<SearchResponse> => {
  const response = await apiClient.post<SearchResponse>(
    '/ai/search-destinations',
    { query }
  );
  return response.data;
};
