import { redirect } from "next/navigation";
import { BookingStatus } from "@prisma/client";
import { BookingsPageClient } from "@/components/admin/BookingsClient";
import { createClient } from "../../../../lib/supabase/server";
import { BookingsApiResponse } from "@/types/bookings";

export const metadata = {
  title: "Bookings | Admin Dashboard",
  description: "Manage and review all bookings for your business.",
};

interface SearchParams {
  page?: string;
  search?: string;
  status?: BookingStatus | "";
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    page: pageParam,
    search: searchParam,
    status: statusParam,
  } = await searchParams;

  // Authentication check
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  // Build query params
  const queryParams = new URLSearchParams({
    page: pageParam || "1",
    ...(searchParam && { search: searchParam }),
    ...(statusParam && { status: statusParam }),
  });

  // Fetch bookings from API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/bookings?${queryParams}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 401) {
      redirect("/admin/login");
    }
    throw new Error(error.message || "Failed to fetch bookings");
  }

  const { data }: BookingsApiResponse = await response.json();
  const { bookings, pagination } = data;

  return (
    <main className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="text-sm text-muted-foreground">
          {pagination.total} total bookings
        </div>
      </div>

      <BookingsPageClient
        initialBookings={bookings}
        totalPages={pagination.totalPages}
        currentPage={pagination.page}
        currentSearch={searchParam || ""}
        currentStatus={statusParam || ""}
        businessId={user.id}
      />
    </main>
  );
}
