import { Metadata } from "next";
import { Suspense } from "react";
import BookingFilters from "@/components/admin/BookingFilters";
import BookingsTable from "@/components/admin/BookingsTable";
import { Booking, Service } from "@prisma/client";
import { toast } from "sonner";

export const metadata: Metadata = {
  title: "Bookings | Admin Dashboard",
  description: "Manage and review all bookings for your business.",
};

// Placeholder for error boundary
function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="p-8 text-center text-red-600">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p>{error.message}</p>
    </div>
  );
}

export default async function BookingsPage() {
  let error: Error | null = null;
  let bookings: Booking[] = [];
  let services: Service[] = [];

  try {
    // Fetch bookings data from the API
    const bookingsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/bookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // You may need to forward cookies/session headers for auth
      },
      cache: "no-store",
    });

    const bookingsJson = await bookingsRes.json();
    if (!bookingsRes.ok || !bookingsJson.success) {
      toast.error("Failed to fetch bookings")
      throw new Error(bookingsJson.error?.message || "Failed to fetch bookings");
    }
    bookings = bookingsJson.data.bookings || [];

    // Fetch services for the filters
    const servicesRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/services`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const servicesJson = await servicesRes.json();
    if (!servicesRes.ok || !servicesJson.success) {
      toast.error("Failed to fetch services")
      throw new Error(servicesJson.error?.message || "Failed to fetch services");
    }
    services = servicesJson.data || [];
  } catch (e: any) {
    error = e;
  }

  if (error) return <ErrorBoundary error={error} />;

  return (
    <main className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Bookings</h1>
      <Suspense fallback={<div>Loading filters...</div>}>
        <BookingFilters services={services} onApply={() => {}} />
      </Suspense>
      <div className="mt-8">
        <Suspense fallback={<div>Loading bookings...</div>}>
          <BookingsTable bookings={bookings} />
        </Suspense>
      </div>
    </main>
  );
}