// app/admin/bookings/page.tsx


import { redirect } from "next/navigation";
import { BookingStatus } from "@prisma/client";
import { BookingsPageClient } from "@/components/admin/BookingsClient";
import { createClient } from "../../../../lib/supabase/server";
import { BookingsApiResponse } from "@/types/bookings";
import { getUserSession } from "../../../../actions/auth";
import { headers } from "next/headers";

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

  const headersBody = await headers()

  // Fetch bookings from API
  const response = await fetch(
    `http://localhost:3000/api/bookings?${queryParams}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Cookie: headersBody.get("cookie") || "",
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

  const jsonResponse = await response.json();
  console.log("API Response:", jsonResponse);

  const { data }: BookingsApiResponse = await jsonResponse;

  // const { bookings, pagination } = await data;

  return (
    <main className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="text-sm text-muted-foreground">
          {/* {data?.pagination.total} total bookings */}
        </div>
      </div>

      <BookingsPageClient
        initialBookings={data?.bookings}
        totalPages={data?.pagination.totalPages}
        currentPage={data?.pagination.page}
        currentSearch={searchParam || ""}
        currentStatus={statusParam || ""}
        businessId={user.id}
      />
    </main>
  );
}
