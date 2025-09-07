"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { cn } from "@/lib/utils"

export interface DateTimePickerProps {
  selectedDate: Date | null
  selectedTime: string | null
  onDateChange: (date: Date | null) => void
  onTimeChange: (time: string | null) => void
  className?: string
}

const SLOT_LABELS = ["09:00", "11:00", "13:00", "15:00", "17:00"] as const

function isPast(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime() < today.getTime()
}

function isSunday(date: Date) {
  return date.getDay() === 0
}

export function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  className,
}: DateTimePickerProps) {
  const handleSelect = (date?: Date) => {
    onDateChange(date ?? null)
    // If date changes, reset time selection
    if (date) {
      onTimeChange(null)
    }
  }

  const disabledMatchers = [
    { before: new Date() },
    (date: Date) => isSunday(date),
  ]

  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      <div className="rounded-md border bg-background p-3">
        <DayPicker
          mode="single"
          selected={selectedDate ?? undefined}
          onSelect={handleSelect}
          disabled={disabledMatchers}
          weekStartsOn={1}
          captionLayout="dropdown-buttons"
          showOutsideDays
        />
      </div>

      <div className="rounded-md border bg-background p-3">
        <h4 className="mb-2 text-sm font-medium">Available time slots</h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SLOT_LABELS.map((slot) => {
            const isSelected = selectedTime === slot
            const isDisabled = !selectedDate
            return (
              <button
                key={slot}
                type="button"
                disabled={isDisabled}
                onClick={() => onTimeChange(slot)}
                className={cn(
                  "rounded-md border p-2 text-sm transition",
                  isSelected
                    ? "border-2 border-primary bg-primary/5"
                    : "border-border hover:bg-accent/50",
                  isDisabled && "opacity-50"
                )}
              >
                {slot}
              </button>
            )
          })}
        </div>
        {!selectedDate && (
          <p className="mt-2 text-xs text-muted-foreground">
            Select a date to choose a time.
          </p>
        )}
      </div>
    </div>
  )
}

export default DateTimePicker


