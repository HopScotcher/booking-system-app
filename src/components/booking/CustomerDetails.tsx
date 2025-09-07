"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const customerDetailsSchema = z.object({
  customerName: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  customerEmail: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  customerPhone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[0-9\s\-().]{7,20}$/, "Please enter a valid phone number"),
  address: z
    .string()
    .min(1, "Address is required")
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must be at most 200 characters"),
  notes: z
    .string()
    .max(500, "Notes must be at most 500 characters")
    .optional()
    .or(z.literal("").transform(() => undefined)),
})

export type CustomerDetailsInput = z.infer<typeof customerDetailsSchema>

export interface CustomerDetailsProps {
  onSubmit: (data: CustomerDetailsInput) => void
  isLoading?: boolean
  defaultValues?: Partial<CustomerDetailsInput>
  className?: string
}

export function CustomerDetails({
  onSubmit,
  isLoading = false,
  defaultValues,
  className,
}: CustomerDetailsProps) {
  const form = useForm<CustomerDetailsInput>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      address: "",
      notes: "",
      ...defaultValues,
    },
  })

  const handleSubmit = form.handleSubmit(onSubmit)

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customerName">Full Name *</Label>
          <Input
            id="customerName"
            type="text"
            placeholder="Enter your full name"
            {...form.register("customerName")}
            aria-invalid={!!form.formState.errors.customerName}
            aria-describedby={
              form.formState.errors.customerName
                ? "customerName-error"
                : undefined
            }
          />
          {form.formState.errors.customerName && (
            <p
              id="customerName-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {form.formState.errors.customerName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email Address *</Label>
          <Input
            id="customerEmail"
            type="email"
            placeholder="Enter your email"
            {...form.register("customerEmail")}
            aria-invalid={!!form.formState.errors.customerEmail}
            aria-describedby={
              form.formState.errors.customerEmail
                ? "customerEmail-error"
                : undefined
            }
          />
          {form.formState.errors.customerEmail && (
            <p
              id="customerEmail-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {form.formState.errors.customerEmail.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerPhone">Phone Number *</Label>
        <Input
          id="customerPhone"
          type="tel"
          placeholder="Enter your phone number"
          {...form.register("customerPhone")}
          aria-invalid={!!form.formState.errors.customerPhone}
          aria-describedby={
            form.formState.errors.customerPhone
              ? "customerPhone-error"
              : undefined
          }
        />
        {form.formState.errors.customerPhone && (
          <p
            id="customerPhone-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {form.formState.errors.customerPhone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Service Address *</Label>
        <Input
          id="address"
          type="text"
          placeholder="Enter the service address"
          {...form.register("address")}
          aria-invalid={!!form.formState.errors.address}
          aria-describedby={
            form.formState.errors.address ? "address-error" : undefined
          }
        />
        {form.formState.errors.address && (
          <p
            id="address-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {form.formState.errors.address.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any special instructions or requirements..."
          rows={3}
          {...form.register("notes")}
          aria-invalid={!!form.formState.errors.notes}
          aria-describedby={
            form.formState.errors.notes ? "notes-error" : undefined
          }
        />
        {form.formState.errors.notes && (
          <p
            id="notes-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {form.formState.errors.notes.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Submitting..." : "Continue to Review"}
      </Button>
    </form>
  )
}

export default CustomerDetails
