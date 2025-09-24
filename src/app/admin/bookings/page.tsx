import { createClient } from "../../../../lib/supabase/server";
import { db } from "../../../../lib/db";
import { redirect } from "next/navigation";
import { BookingStatus } from "@prisma/client";
import { BookingsPageClient } from "@/components/admin/BookingsClient";

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
  const { page: pageParam, search: searchParam, status: statusParam } =
    await searchParams;

  // Authentication and business context
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  // Get user's business
  const dbUser = await db.user.findUnique({
    where: { email: user.email! },
    include: { business: true },
  });

  if (!dbUser || !dbUser.business) {
    redirect("/error?reason=business_not_found");
  }

  const businessId = dbUser.businessId;

  // Parse search params
  const page = parseInt(pageParam || "1");
  const search = searchParam || "";
  const status = statusParam || "";
  const limit = 10;
  const offset = (page - 1) * limit;

  // Build where clause for filtering
  const whereClause = {
    businessId,
    deletedAt: null,
    ...(status && { status: status as BookingStatus }),
    ...(search && {
      OR: [
        { customerName: { contains: search, mode: "insensitive" as const } },
        { customerPhone: { contains: search, mode: "insensitive" as const } },
        { customerEmail: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  // Fetch bookings and total count
  // const [bookings, totalCount] = await Promise.all([
  //   db.booking.findMany({
  //     where: whereClause,
  //     orderBy: { createdAt: 'desc' },
  //     take: limit,
  //     skip: offset,
  //     select: {
  //       id: true,
  //       customerName: true,
  //       customerPhone: true,
  //       customerEmail: true,
  //       serviceName: true,
  //       appointmentDate: true,
  //       appointmentTime: true,
  //       status: true,
  //       confirmationCode: true,
  //     },
  //   }),
  //   db.booking.count({ where: whereClause }),
  // ])

  const bookings = await db.booking.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    select: {
      id: true,
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      serviceName: true,
      appointmentDate: true,
      appointmentTime: true,
      status: true,
      confirmationCode: true,
    },
  });

  const totalCount = await db.booking.count({ where: whereClause });

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <main className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="text-sm text-muted-foreground">
          {totalCount} total bookings
        </div>
      </div>

      <BookingsPageClient
        initialBookings={bookings}
        totalPages={totalPages}
        currentPage={page}
        currentSearch={search}
        currentStatus={status}
        businessId={businessId}
      />
    </main>
  );
}

// // admin/bookings

// import { Suspense } from "react";
// import { BookingsContent } from "@/components/admin/BookingsContent";

// export const metadata = {
//   title: "Bookings | Admin Dashboard",
//   description: "Manage and review all bookings for your business.",
// };

// export default function BookingsPage() {
//   return (
//     <main className="container mx-auto py-8">
//       <h1 className="mb-6 text-2xl font-bold">Bookings</h1>
//       <Suspense fallback={<div>Loading bookings...</div>}>
//         <BookingsContent />
//       </Suspense>
//     </main>
//   );
// }
