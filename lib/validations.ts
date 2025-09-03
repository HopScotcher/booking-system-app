import { z } from 'zod'

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Booking validation schemas
export const createBookingSchema = z.object({
  serviceId: z.string().cuid('Invalid service ID'),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Please enter a valid email address'),
  customerPhone: z.string().min(10, 'Please enter a valid phone number'),
  customerAddress: z.string().min(10, 'Please enter a complete address'),
  appointmentDate: z.string().datetime('Please select a valid date'),
  appointmentTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please select a valid time'),
  notes: z.string().optional(),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  cancellationNote: z.string().optional(),
})

// Business validation schemas
export const createBusinessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().optional(),
  description: z.string().optional(),
})

export const createServiceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  duration: z.number().positive('Duration must be greater than 0'),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>
export type CreateServiceInput = z.infer<typeof createServiceSchema>