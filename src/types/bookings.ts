// src/types/bookings.ts
import { Booking, BookingStatus } from "@prisma/client";

// export interface Booking {
//   id: string;
//   customerName: string;
//   customerPhone: string;
//   customerEmail: string;
//   serviceName: string;
//   appointmentDate: Date;
//   appointmentTime: string;
//   status: BookingStatus;
//   confirmationCode: string;
// }

export interface BookingsPageProps {
  initialBookings: Booking[];
  totalPages: number;
  currentPage: number;
  currentSearch: string;
  currentStatus: BookingStatus | "";
  businessId: string;
}

export interface BookingsApiResponse {
  success: boolean;
  data: {
    bookings: Booking[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}
