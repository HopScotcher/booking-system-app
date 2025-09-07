"use client";

import { useState } from "react";
import { BookingStatus, Service } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

const statusOptions = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
];

export interface BookingFiltersProps {
  services: Service[];
  onApply: (filters: {
    status: BookingStatus | "";
    fromDate: Date | null;
    toDate: Date | null;
    search: string;
    serviceId: string;
  }) => void;
}

export default function BookingFilters({
  services,
  onApply,
}: BookingFiltersProps) {
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [serviceId, setServiceId] = useState("");

  function clearFilters() {
    setStatus("");
    setFromDate(null);
    setToDate(null);
    setSearch("");
    setServiceId("");
    onApply({
      status: "",
      fromDate: null,
      toDate: null,
      search: "",
      serviceId: "",
    });
  }

  function handleApply() {
    onApply({ status, fromDate, toDate, search, serviceId });
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow md:flex-row md:items-end md:gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleApply();
      }}
    >
      {/* Status Filter */}
      <div className="w-full md:w-40">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Status
        </label>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as BookingStatus | "")}
        >
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Date Range Picker */}
      <div className="flex w-full flex-col gap-2 md:w-64 md:flex-row md:gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            From
          </label>
            <Calendar
              mode="single"
              selected={fromDate ?? undefined}
              onSelect={setFromDate}
              className="w-full"
            //review this part to check if required or not   
              required  
            />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            To
          </label>
            <Calendar
              mode="single"
              selected={toDate ?? undefined}
              onSelect={setToDate}
              className="w-full"
              //review this part to check if required or not 
              required
            />
        </div>
      </div>
      {/* Search Input */}
      <div className="w-full md:w-56">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Customer
        </label>
        <Input
          type="text"
          placeholder="Name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {/* Service Type Filter */}
      <div className="w-full md:w-48">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Service
        </label>
        <Select value={serviceId} onValueChange={setServiceId}>
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Buttons */}
      <div className="flex w-full gap-2 md:w-auto md:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={clearFilters}
          className="w-full md:w-auto"
        >
          Clear
        </Button>
        <Button type="submit" className="w-full md:w-auto">
          Apply
        </Button>
      </div>
    </form>
  );
}
