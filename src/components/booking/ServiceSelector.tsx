"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Service } from "@prisma/client";

export interface ServiceSelectorProps {
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (serviceId: string) => void;
  className?: string;
  services: Service[]; // FIXED: Should be array, not single Service
}

export function ServiceSelector({
  value,
  defaultValue = null,
  onChange,
  className,
  services
}: ServiceSelectorProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string | null>(
    defaultValue
  );
  
  const selectedId = isControlled ? (value ?? null) : internalValue;

  const handleSelect = (id: string) => {
    if (!isControlled) {
      setInternalValue(id);
    }
    onChange?.(id);
  };

  // Handle missing or empty services
  if (!services) {
    return (
      <div className="p-6 text-center">
        <div className="text-destructive bg-destructive/10 rounded-lg p-4">
          <h3 className="font-semibold">Services Unavailable</h3>
          <p className="text-sm mt-1">Unable to load services. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-muted-foreground bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold">No Services Available</h3>
          <p className="text-sm mt-1">This business hasn't added any services yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {services.map((service) => {
        const isSelected = service.id === selectedId;
        return (
          <button
            key={service.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => handleSelect(service.id)}
            className={cn(
              "text-left rounded-lg border bg-background p-4 transition",
              "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isSelected ? "border-2 border-primary shadow-sm" : "border-border"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold leading-6">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                )}
              </div>
              <div
                aria-hidden
                className={cn(
                  "mt-1 h-4 w-4 rounded-full border",
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30"
                )}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-medium">
                ${service.price.toFixed(0)}
              </span>
              <span className="text-muted-foreground">
                {/* Convert minutes to hours if needed */}
                {service.duration >= 60 
                  ? `${(service.duration / 60).toFixed(1)} hr${service.duration > 60 ? "s" : ""}`
                  : `${service.duration} min`
                }
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ServiceSelector;