"use client"

import * as React from "react"
import { SERVICES, type ServiceConfig } from "@/lib/data/services"
import { cn } from "@/lib/utils"

export interface ServiceSelectorProps {
  services?: readonly ServiceConfig[]
  value?: "BASIC_CLEANING" | "DEEP_CLEANING" | "MOVE_IN_OUT_CLEANING" | null
  defaultValue?: "BASIC_CLEANING" | "DEEP_CLEANING" | "MOVE_IN_OUT_CLEANING" | null
  onChange?: (serviceId: "BASIC_CLEANING" | "DEEP_CLEANING" | "MOVE_IN_OUT_CLEANING") => void
  className?: string
}

export function ServiceSelector({
  services = SERVICES,
  value,
  defaultValue = null,
  onChange,
  className,
}: ServiceSelectorProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState<"BASIC_CLEANING" | "DEEP_CLEANING" | "MOVE_IN_OUT_CLEANING" | null>(
    defaultValue,
  )

  const selectedId = isControlled ? value ?? null : internalValue

  const handleSelect = (id: "BASIC_CLEANING" | "DEEP_CLEANING" | "MOVE_IN_OUT_CLEANING") => {
    if (!isControlled) {
      setInternalValue(id)
    }
    onChange?.(id)
  }

  return (
    <div
      role="radiogroup"
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {services.map((service) => {
        const isSelected = service.id === selectedId
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
              isSelected
                ? "border-2 border-primary shadow-sm"
                : "border-border",
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
                    : "border-muted-foreground/30",
                )}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-medium">
                ${""}
                {service.basePrice.toFixed(0)}
              </span>
              <span className="text-muted-foreground">
                {service.duration} hr{service.duration > 1 ? "s" : ""}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ServiceSelector


