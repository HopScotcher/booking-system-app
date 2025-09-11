// src/hooks/useBookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { BookingStatus } from '@prisma/client'
import { BookingInput } from '@/lib/validations/booking'

// Types
// interface CreateBookingData {
//   service: string
//   date: Date
//   time: string
//   customerName: string
//   customerEmail: string
//   customerPhone: string
//   address: string
//   notes?: string
// }

interface BookingFilters {
  page?: number
  limit?: number
  status?: BookingStatus
  dateFrom?: string
  dateTo?: string
  search?: string
  service?: string
}

interface UpdateBookingStatusData {
  status: BookingStatus
}

// CLIENT HOOKS (Public - no auth required)

// Create a new booking
export function useCreateBooking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (bookingData: BookingInput) => {
      console.log(`booking data from hook: ${bookingData}`)
      return (await axios.post('/api/bookings', bookingData)).data
    },
    onSuccess: () => {
      // Invalidate any booking-related queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (error) => {
      console.error('Booking creation failed:', error)
    }
  })
}

// Get booking details by ID (public - for confirmation page)
export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => (await axios.get(`/api/bookings/${id}`)).data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get booking by confirmation code (alternative to ID)
export function useBookingByConfirmation(confirmationCode: string) {
  return useQuery({
    queryKey: ['booking', 'confirmation', confirmationCode],
    queryFn: async () => (await axios.get(`/api/bookings/${confirmationCode}`)).data,
    enabled: !!confirmationCode,
    staleTime: 5 * 60 * 1000,
  })
}

// ADMIN HOOKS (Auth required)

// Get all bookings with filters (admin/staff only)
export function useBookings(filters: BookingFilters = {}) {
  const queryParams = new URLSearchParams()
  
  if (filters.page) queryParams.append('page', filters.page.toString())
  if (filters.limit) queryParams.append('limit', filters.limit.toString())
  if (filters.status) queryParams.append('status', filters.status)
  if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
  if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)
  if (filters.search) queryParams.append('search', filters.search)
  if (filters.service) queryParams.append('service', filters.service)

  return useQuery({
    queryKey: ['bookings', 'admin', filters],
    queryFn: async () => {
      const url = `/api/bookings${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      return (await axios.get(url)).data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Update booking status (admin/staff only)
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & UpdateBookingStatusData) => {
      return (await axios.patch(`/api/bookings/${id}`, updateData)).data
    },
    onSuccess: (data, variables) => {
      // Update the specific booking in cache
      queryClient.setQueryData(['booking', variables.id], data)
      
      // Invalidate bookings list to refresh
      queryClient.invalidateQueries({ queryKey: ['bookings', 'admin'] })
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
    onError: (error) => {
      console.error('Booking status update failed:', error)
    }
  })
}

// Get booking stats for dashboard
export function useBookingStats(dateRange?: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ['dashboard', 'stats', dateRange],
    queryFn: async () => {
      // This would need a new API endpoint: /api/dashboard/stats
      const params = new URLSearchParams()
      if (dateRange?.from) params.append('from', dateRange.from.toISOString())
      if (dateRange?.to) params.append('to', dateRange.to.toISOString())
      
      return (await axios.get(`/api/dashboard/stats?${params.toString()}`)).data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// BUSINESS & SERVICES HOOKS

// Get business info (public)
export function useBusiness(businessId?: string) {
  return useQuery({
    queryKey: ['business', businessId || 'default'],
    queryFn: async () => {
      const url = businessId ? `/api/business/${businessId}` : '/api/business'
      return (await axios.get(url)).data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - business info changes rarely
  })
}

// Get available services (public)
export function useServices(businessId?: string) {
  return useQuery({
    queryKey: ['services', businessId || 'default'],
    queryFn: async () => {
      const url = businessId ? `/api/services?businessId=${businessId}` : '/api/services'
      return (await axios.get(url)).data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Get service by ID (public)
export function useService(serviceId: string) {
  return useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => (await axios.get(`/api/services/${serviceId}`)).data,
    enabled: !!serviceId,
    staleTime: 10 * 60 * 1000,
  })
}

// Check time slot availability (public)
export function useTimeSlotAvailability(date: Date, serviceId: string) {
  return useQuery({
    queryKey: ['availability', date?.toDateString(), serviceId],
    queryFn: async () => {
      const params = new URLSearchParams({
        date: date.toISOString().split('T')[0],
        serviceId: serviceId
      })
      return (await axios.get(`/api/availability?${params.toString()}`)).data
    },
    enabled: !!date && !!serviceId,
    staleTime: 2 * 60 * 1000, // 2 minutes - availability changes quickly
  })
}

// UTILITY HOOKS

// Prefetch booking for confirmation page
export function usePrefetchBooking() {
  const queryClient = useQueryClient()
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['booking', id],
      queryFn: async () => (await axios.get(`/api/bookings/${id}`)).data,
      staleTime: 5 * 60 * 1000,
    })
  }
}

// Optimistic booking status update
export function useOptimisticStatusUpdate() {
  const queryClient = useQueryClient()
  
  return (bookingId: string, newStatus: BookingStatus) => {
    queryClient.setQueryData(['booking', bookingId], (oldData: any) => {
      if (!oldData) return oldData
      return {
        ...oldData,
        data: {
          ...oldData.data,
          status: newStatus,
          updatedAt: new Date().toISOString()
        }
      }
    })
  }
}