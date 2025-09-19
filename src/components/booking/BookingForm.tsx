"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceSelector } from "./ServiceSelector";
import { DateTimePicker } from "./DateTimePicker";
import { CustomerDetails } from "./CustomerDetails";
import { bookingSchema, type BookingInput } from "@/lib/validations/booking";
import { BookingFormData } from "@/types/types";
import { SERVICES } from "@/lib/data/services";
import { useCreateBooking } from "@/hooks/useBooking";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/hooks/useServices";
import { Booking, Business, Service } from "@prisma/client";

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  {
    id: 1,
    title: "Select Service",
    description: "Choose your cleaning service",
  },
  { id: 2, title: "Pick Date & Time", description: "Select appointment slot" },
  { id: 3, title: "Your Details", description: "Provide contact information" },
  { id: 4, title: "Review & Book", description: "Confirm your booking" },
] as const;

export interface BookingFormProps {
  className?: string;
  business: Business;
  services: Service[];
}

export function BookingForm({
  className,
  business,
  services,
}: BookingFormProps) {
  const [currentStep, setCurrentStep] = React.useState<Step>(1);
  // const { data: servicesData } = useServices();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const createBooking = useCreateBooking();
  const router = useRouter();

  const [formData, setFormData] = useState<BookingFormData>({
    businessId: "",
    service: "",
    date: null,
    time: null,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    notes: "",
  });

  async function submitBookingForm() {
    if (!formData.service || !formData.date || !formData.time) {
      setError("Please complete all required fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Combine date and time into a single Date object for the Zod schema
      const appointmentDateTime = new Date(formData.date);
      const [hours, minutes] = formData.time.split(":").map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      // Prepare data for validation and API
      const bookingData: BookingFormData & { businessId: string } = {
        businessId: business.id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        service: formData.service,
        date: appointmentDateTime,
        time: formData.time,
        address: formData.address,
        notes: `${formData.notes}`,
      };

      console.log(`BookingForm.tsx: ${bookingData}`);

      // Validate with Zod schema
      const validatedData = bookingSchema.parse(bookingData);

      console.log(`Validated data bookingform: ${validatedData}`);

      // Send to API endpoint
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error("Failed to create booking", {
          description: "Please try again later",
        });
        throw new Error(
          errorData?.error?.message || "Failed to create booking"
        );
      }

      const data = await res.json();
      toast.success("Booking Created successfully");
      router.push(`/confirmation?id=${data.data.id}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  const updateFormData = (updates: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.service;
      case 2:
        return !!formData.date && !!formData.time;
      case 3:
        return !!(
          formData.customerName &&
          formData.customerEmail &&
          formData.customerPhone &&
          formData.address
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
      setError(null);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
      setError(null);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    updateFormData({ service: serviceId });
  };

  const handleDateChange = (date: Date | null) => {
    updateFormData({ date, time: null });
  };

  const handleTimeChange = (time: string | null) => {
    updateFormData({ time });
  };

  const handleCustomerDetailsSubmit = (data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    notes?: string;
  }) => {
    updateFormData(data);
    handleNext();
  };

  const getSelectedService = () => {
    // return servicesData?.data?.find((s) => s.id === formData.service);
    return services.find((s) => s.id === formData.service);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelector
            value={formData.service}
            onChange={handleServiceSelect}
            services={services}
          />
        );

      case 2:
        return (
          <DateTimePicker
            selectedDate={formData.date}
            selectedTime={formData.time}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
          />
        );

      case 3:
        return (
          <CustomerDetails
            onSubmit={handleCustomerDetailsSubmit}
            defaultValues={{
              customerName: formData.customerName,
              customerEmail: formData.customerEmail,
              customerPhone: formData.customerPhone,
              address: formData.address,
              notes: formData.notes,
            }}
          />
        );

      case 4:
        const selectedService = getSelectedService();
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="font-medium">Service</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedService?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${selectedService?.price} • {selectedService?.duration}{" "}
                      hours
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Appointment</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.date?.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.time}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Customer Details</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.customerName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.customerEmail}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.customerPhone}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">Service Address</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.address}
                  </p>
                </div>

                {formData.notes && (
                  <div>
                    <h4 className="font-medium">Additional Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={submitBookingForm}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Creating Booking..." : "Confirm & Book"}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors",
                    currentStep >= step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors",
                    currentStep > step.id
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="mb-6">{renderStepContent()}</div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        {currentStep < 4 && (
          <Button onClick={handleNext} disabled={!canProceedToNext()}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

export default BookingForm;
