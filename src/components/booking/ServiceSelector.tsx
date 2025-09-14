"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Service } from "@prisma/client";
import { useServices } from "@/hooks/useServices";
// import { Skeleton } from "@/components/ui/skeleton";

export interface ServiceSelectorProps {
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (serviceId: string) => void;
  className?: string;
}

export function ServiceSelector({
  value,
  defaultValue = null,
  onChange,
  className,
}: ServiceSelectorProps) {
  const { data: servicesData, isLoading, error } = useServices();
  const services = servicesData?.data ?? [];

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-lg border bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive bg-destructive/10 rounded-lg">
        Failed to load services
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
                <p className="mt-1 text-sm text-muted-foreground">
                  {service.description}
                </p>
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
                ${""}
                {service.price.toFixed(0)}
              </span>
              <span className="text-muted-foreground">
                {service.duration} hr{service.duration > 1 ? "s" : ""}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ServiceSelector;
