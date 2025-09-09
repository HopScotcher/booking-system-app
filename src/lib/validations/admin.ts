import { z } from "zod";
import { BookingStatus } from "@prisma/client";

// Login form validation
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// Booking filters validation
export const bookingFiltersSchema = z.object({
  status: z.union([z.nativeEnum(BookingStatus), z.literal("")]).optional(),
  fromDate: z.string().optional(), // ISO date string or empty
  toDate: z.string().optional(),
  search: z.string().optional(),
  serviceId: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

// Status update validation
export const statusUpdateSchema = z.object({
  status: z.nativeEnum(BookingStatus),
});

// Query parameter validation for APIs
export const queryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(BookingStatus).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  service: z.string().optional(),
});
