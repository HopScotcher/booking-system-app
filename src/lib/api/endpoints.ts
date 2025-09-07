import { apiClient } from "./client";
import { BookingFormData, BookingData } from "@/types/types";

// Booking API endpoints
export const bookingApi = {
  // Create a new booking
  createBooking: async (
    data: BookingFormData
  ): Promise<{ success: boolean; data: BookingData; message: string }> => {
    const response = await apiClient.post("/bookings", data);
    return response.data;
  },

  // Get booking by ID
  getBooking: async (
    id: string
  ): Promise<{ success: boolean; data: BookingData }> => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  // Get all bookings (for admin)
  getBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    businessId?: string;
  }): Promise<{ success: boolean; data: BookingData[]; pagination?: any }> => {
    const response = await apiClient.get("/bookings", { params });
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (
    id: string,
    status: string
  ): Promise<{ success: boolean; data: BookingData }> => {
    const response = await apiClient.patch(`/bookings/${id}/status`, {
      status,
    });
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (
    id: string,
    reason?: string
  ): Promise<{ success: boolean; data: BookingData }> => {
    const response = await apiClient.patch(`/bookings/${id}/cancel`, {
      reason,
    });
    return response.data;
  },
};

// Service API endpoints
export const serviceApi = {
  // Get all services for a business
  getServices: async (
    businessId?: string
  ): Promise<{ success: boolean; data: any[] }> => {
    const response = await apiClient.get("/services", {
      params: businessId ? { businessId } : {},
    });
    return response.data;
  },

  // Get service by ID
  getService: async (id: string): Promise<{ success: boolean; data: any }> => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },
};

// Business API endpoints
export const businessApi = {
  // Get business by slug
  getBusinessBySlug: async (
    slug: string
  ): Promise<{ success: boolean; data: any }> => {
    const response = await apiClient.get(`/business/slug/${slug}`);
    return response.data;
  },

  // Get business by ID
  getBusiness: async (id: string): Promise<{ success: boolean; data: any }> => {
    const response = await apiClient.get(`/business/${id}`);
    return response.data;
  },
};
