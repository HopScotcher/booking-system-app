// admin/bookings 

import { Suspense } from "react";
import { BookingsContent } from "@/components/admin/BookingsContent";

export const metadata = {
  title: "Bookings | Admin Dashboard",
  description: "Manage and review all bookings for your business.",
};

export default function BookingsPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Bookings</h1>
      <Suspense fallback={<div>Loading bookings...</div>}>
        <BookingsContent />
      </Suspense>
    </main>
  );
}

