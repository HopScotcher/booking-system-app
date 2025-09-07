"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { BookingStatus } from "@prisma/client";
import { toast } from "sonner";
import BookingStatusBadge from "./BookingStatusBadge";

interface StatusUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: string;
    customerName: string;
    serviceName: string;
    appointmentDate: string;
    status: BookingStatus;
  };
  onStatusUpdated?: (newStatus: BookingStatus) => void;
}

const statusOptions: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export default function StatusUpdateModal({
  open,
  onOpenChange,
  booking,
  onStatusUpdated,
}: StatusUpdateModalProps) {
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Booking status updated");
        onOpenChange(false);
        onStatusUpdated?.(status);
      } else {
        toast.error(data.error?.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset status when modal opens for a new booking
  // (if parent reuses the modal instance)
  useEffect(() => {
    setStatus(booking.status);
  }, [booking.id, booking.status]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Booking Status</DialogTitle>
          <DialogDescription>
            Update the status for this booking. This action is logged.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4 space-y-1">
          <div className="text-sm font-medium text-gray-700">
            Customer:{" "}
            <span className="font-semibold">{booking.customerName}</span>
          </div>
          <div className="text-sm text-gray-700">
            Service:{" "}
            <span className="font-semibold">{booking.serviceName}</span>
          </div>
          <div className="text-sm text-gray-700">
            Date:{" "}
            <span className="font-semibold">
              {new Date(booking.appointmentDate).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            Current Status: <BookingStatusBadge status={booking.status} />
          </div>
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            New Status
          </label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as BookingStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading || status === booking.status}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
