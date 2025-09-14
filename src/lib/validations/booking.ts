import { z } from "zod"

// Service validation
export const ServiceIdSchema = z.string().cuid("Invalid service ID")

const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/
const time24hRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const bookingSchema = z.object({
  customerName: z
    .string()
    .min(1, "Customer name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  customerEmail: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  customerPhone: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Please enter a valid phone number"),
  service: ServiceIdSchema,
  date: z
    .coerce.date()
    .refine((d) => d.getTime() > Date.now(), "Date must be in the future"),
  time: z
    .string()
    .min(1, "Time is required")
    .regex(time24hRegex, "Time must be in 24-hour HH:MM format"),
  address: z
    .string()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be at most 200 characters"),
  notes: z
    .string()
    .max(500, "Notes must be at most 500 characters")
    .optional()
    .or(z.literal("").transform(() => undefined)),
})

export type BookingInput = z.infer<typeof bookingSchema>


