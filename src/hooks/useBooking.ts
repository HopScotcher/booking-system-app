import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '@/lib/api/endpoints';
import { BookingFormData, BookingData } from '@/types/types';

// Query keys for consistent caching
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

// Hook to create a new booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookingFormData) => bookingApi.createBooking(data),
    onSuccess: (response) => {
      // Invalidate and refetch bookings list
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      
      // Optionally prefetch the created booking
      if (response.data?.id) {
        queryClient.setQueryData(
          bookingKeys.detail(response.data.id),
          response.data
        );
      }
    },
    onError: (error) => {
      console.error('Failed to create booking:', error);
    },
  });
};

// Hook to get a single booking by ID
export const useBooking = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingApi.getBooking(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000})