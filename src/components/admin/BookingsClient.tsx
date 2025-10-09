// /src/app/admin/bookings/bookings-client.tsx

"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingStatus } from "@prisma/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

import BookingStatusBadge from "@/components/admin/BookingStatusBadge";

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceName: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: BookingStatus;
  confirmationCode: string;
}

type StatusFilter = BookingStatus | "ALL";

interface BookingsPageClientProps {
  initialBookings: Booking[];
  totalPages: number;
  currentPage: number;
  currentSearch: string;
  currentStatus: BookingStatus | "";
  businessId: string;
}

const statusOptions = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
];

type OptimisticUpdate = {
  bookingId: string;
  newStatus: BookingStatus;
};

export function BookingsPageClient({
  initialBookings,
  totalPages,
  currentPage,
  currentSearch,
  currentStatus,
  businessId,
}: BookingsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialBookings);
  const [search, setSearch] = useState(currentSearch);
  const [status, setStatus] = useState<StatusFilter>(
    currentStatus === "" ? "ALL" : (currentStatus as StatusFilter)
  );

  // const [optimisticBookings, updateOptimisticBooking] = useOptimistic(
  //   initialBookings,
  //   (state: Booking[], { bookingId, newStatus }: OptimisticUpdate) =>
  //     state.map((booking) =>
  //       booking.id === bookingId ? { ...booking, status: newStatus } : booking
  //     )
  // );

  const [optimisticBookings, updateOptimisticBookings] = useOptimistic(
    data,
    (currentBookings, { bookingId, newStatus }: OptimisticUpdate) => {
      return currentBookings.map((b) =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      );
    }
  );

  const handleStatusChange = async (
    bookingId: string,
    newStatus: BookingStatus
  ) => {
    // Optimistically update UI
    updateOptimisticBookings({ bookingId, newStatus });

    startTransition(async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
          throw new Error("Failed to update booking");
        }

        const result = await res.json();

        // Replace state with updated version from backend
        setData((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, ...result.data } : b))
        );
      } catch (err) {
        console.error(err);
        // Optionally rollback the optimistic change
        setData(initialBookings);
      }
    });
  };

  // const updateBookingStatusAction = async (
  //   bookingId: string,
  //   newStatus: BookingStatus
  // ) => {
  //   const previousStatus = optimisticBookings.find(
  //     (booking: Booking) => booking.id === bookingId
  //   )?.status;
  //   if (!previousStatus) return;

  //   try {
  //     const response = await fetch(`/api/bookings/${bookingId}`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ status: newStatus, businessId }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok) {
  //       throw new Error(result.message || "Failed to update status");
  //     }

  //     toast.success("Booking status updated successfully");
  //   } catch (error) {
  //     // Revert optimistic update on error
  //     startTransition(() => {
  //       updateOptimisticBooking({ bookingId, newStatus: previousStatus });
  //     });

  //     toast.error(
  //       error instanceof Error ? error.message : "Failed to update status"
  //     );
  //   }
  // };

  // const handleStatusUpdate = (bookingId: string, newStatus: BookingStatus) => {
  //   updateOptimisticBooking({ bookingId, newStatus });
  //   // Wrap the optimistic update in startTransition
  //   startTransition(() => {

  //     updateBookingStatusAction(bookingId, newStatus);
  //   });
  // };

  // Update URL with new search params

  const updateSearchParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filtering
    if ("search" in newParams || "status" in newParams) {
      params.set("page", "1");
    }

    startTransition(() => {
      router.push(`/admin/bookings?${params.toString()}`);
    });
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ search, status });
  };

  // Handle status filter change
  const handleStatusFilter = (newStatus: string) => {
    setStatus(newStatus as StatusFilter);
    updateSearchParams({
      search,
      status: newStatus === "ALL" ? "" : newStatus,
    });
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: i.toString() }).toString()}`}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show ellipsis for large page counts
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: "1" }).toString()}`}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(<PaginationEllipsis key="start-ellipsis" />);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: i.toString() }).toString()}`}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<PaginationEllipsis key="end-ellipsis" />);
      }

      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              href={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: totalPages.toString() }).toString()}`}
              isActive={currentPage === totalPages}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 p-4 bg-card rounded-lg border">
        <form onSubmit={handleSearch} className="flex gap-4 flex-1">
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={status} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions
                .filter((o) => o.value !== "ALL") // exclude "ALL" here
                .map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Loading..." : "Search"}
          </Button>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              optimisticBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.customerName}
                  </TableCell>
                  <TableCell>{booking.customerPhone}</TableCell>
                  <TableCell>{booking.serviceName}</TableCell>
                  <TableCell>
                    <div>
                      {new Date(booking.appointmentDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.appointmentTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={booking.status}
                      onValueChange={(value) =>
                        handleStatusChange(booking.id, value as BookingStatus)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-[130px]">
                        <BookingStatusBadge status={booking.status} />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.slice(1).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={
                  currentPage > 1
                    ? `?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: (currentPage - 1).toString() }).toString()}`
                    : "#"
                }
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {generatePaginationItems()}

            <PaginationItem>
              <PaginationNext
                href={
                  currentPage < totalPages
                    ? `?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: (currentPage + 1).toString() }).toString()}`
                    : "#"
                }
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
