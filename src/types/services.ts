import { Service } from "@prisma/client";

export interface ServiceResponse {
  success: boolean;
  data: Service[];
  error?: string;
}

export interface BookingFormData {
  service: string;
  date: Date | null;
  time: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  notes: string;
}

export interface ServiceInputProps {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number;
}
