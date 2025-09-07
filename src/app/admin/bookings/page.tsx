import { Metadata } from "next";
import { Suspense } from "react";
import BookingFilters from "@/components/admin/BookingFilters";
// import BookingsTable from "@/components/admin/BookingsTable"; // To be implemented

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
  // Server-side fetch for initial bookings data and services for filters
  // (Replace with real fetch logic as needed)
  let bookings = [];
  let services = [];
  let error = null;
  try {
    // Example: Fetch bookings and services from your API or db
    // const res = await fetch("/api/bookings");
    // bookings = await res.json();
    // services = await fetchServices();
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
          {/* <BookingsTable bookings={bookings} /> */}
          <div className="text-gray-500">Bookings table coming soon...</div>
        </Suspense>
      </div>
    </main>
  );
}
