// import { Booking, Business, Service, User, BookingStatus, Role } from '@prisma/client'

// // Extended types with relations
// export type BookingWithRelations = Booking & {
//   business: Business
//   service: Service
//   user?: User | null
// }

// export type BusinessWithServices = Business & {
//   services: Service[]
// }

// export type ServiceWithBusiness = Service & {
//   business: Business
// }

// // API Response types
// export interface ApiResponse<T = any> {
//   success: boolean
//   data?: T
//   error?: {
//     code: string
//     message: string
//     details?: any
//   }
// }

// export interface PaginatedResponse<T> extends ApiResponse<T[]> {
//   pagination?: {
//     page: number
//     limit: number
//     total: number
//     pages: number
//   }
// }



// export interface LoginFormData {
//   email: string
//   password: string
// }

// // Dashboard types
// export interface DashboardStats {
//   totalBookings: number
//   pendingBookings: number
//   confirmedBookings: number
//   completedBookings: number
//   totalRevenue: number
//   monthlyRevenue: number
// }

// // Time slot types
// export interface TimeSlot {
//   time: string
//   available: boolean
//   reason?: string
// }

// // Business hours type
// export interface BusinessHours {
//   [key: string]: {
//     open: string
//     close: string
//     closed?: boolean
//   }
// }

// // Booking settings type
// export interface BookingSettings {
//   maxAdvanceDays: number
//   minAdvanceHours: number
//   slotDuration: number
//   bufferTime: number
//   workingDays: string[]
//   timeSlots: string[]
// }

// // Export Prisma enums for convenience
// export { BookingStatus, Role }


export interface BookingData {
    id: string
    confirmationCode: string
    customerName: string
    customerEmail: string
    customerPhone: string
    customerAddress: string
    serviceName: string
    servicePrice: number
    serviceDuration: number
    appointmentDate: string
    appointmentTime: string
    duration: number
    totalPrice: number
    notes?: string
    status: string
    business: {
      name: string
      email: string
      phone: string
    }
    createdAt: string
  }

  export interface BookingFormData {
  service: string | null;
  date: Date | null;
  time: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  notes?: string;
}




   