"use client";

import { useState } from "react";
import { BookingStatus } from "@prisma/client";
import StatusUpdateModal from "./StatusUpdateModal";
import BookingStatusBadge from "./BookingStatusBadge";
import { Button } from "@/components/ui/button";
 

interface Booking {
  id: string;
  confirmationCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: BookingStatus;
}

interface BookingsTableProps {
  bookings: Booking[];
  loading?: boolean;
  onStatusUpdated?: (id: string, status: BookingStatus) => void;
}

export default function BookingsTable({
  bookings,
  loading,
  onStatusUpdated,
}: BookingsTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const handleStatusUpdated = (newStatus: BookingStatus) => {
    if (selectedBooking) {
      onStatusUpdated?.(selectedBooking.id, newStatus);
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="text-center text-gray-500 py-8">No bookings found.</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Date/Time
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Customer
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Phone
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Service
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bookings.map((b) => (
            <tr key={b.id} className="hover:bg-blue-50 transition-colors">
              <td className="px-4 py-2 whitespace-nowrap">
                <span title={b.appointmentDate + " " + b.appointmentTime}>
                  {new Date(b.appointmentDate).toLocaleDateString()}
                  <br />
                  <span className="text-xs text-gray-500">
                    {b.appointmentTime}
                  </span>
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap max-w-[160px]">
                <span title={b.customerName}>
                  {b.customerName.length > 18
                    ? b.customerName.slice(0, 16) + "…"
                    : b.customerName}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap max-w-[120px]">
                <span title={b.customerPhone}>
                  {b.customerPhone.length > 14
                    ? b.customerPhone.slice(0, 12) + "…"
                    : b.customerPhone}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap max-w-[160px]">
                <span title={b.serviceName}>
                  {b.serviceName.length > 18
                    ? b.serviceName.slice(0, 16) + "…"
                    : b.serviceName}
                </span>
              </td>
              <td className="px-4 py-2">
                <button
                  className="focus:outline-none"
                  onClick={() => handleOpenModal(b)}
                  title="Update status"
                >
                  <BookingStatusBadge status={b.status} />
                </button>
              </td>
              <td className="px-4 py-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => alert("View details coming soon")}
                >
                  View
                </Button>
                <Button size="sm" onClick={() => handleOpenModal(b)}>
                  Update Status
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination controls placeholder */}
      <div className="flex items-center justify-between p-4 border-t bg-gray-50">
        <div className="text-xs text-gray-500">Page 1 of 1</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled>
            Prev
          </Button>
          <Button size="sm" variant="outline" disabled>
            Next
          </Button>
        </div>
      </div>
      {selectedBooking && (
        <StatusUpdateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          booking={selectedBooking}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}
