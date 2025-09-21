import { Metadata } from "next";
import { db } from "../../../../lib/db";
import { BookingStatus } from "@prisma/client";
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase/server";
// import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
  description: "Business overview and key metrics.",
};

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div
      className={`rounded-lg bg-white p-6 shadow flex flex-col items-center ${color ?? ""}`}
    >
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/admin/login");
  }

  console.log(data?.user.email);

  // Get business info from YOUR database, not Supabase metadata
  const user = await db.user.findUnique({
    where: { email: data.user.email! },
    include: { business: true },
  });

  if (!user || !user.business) {
    redirect("/error?reason=business_not_found");
  }

  console.log("Business ID:", user.businessId);
  console.log("Business Name:", user.business.name);

  
  const businessId = user.business.id;

  console.log(businessId);

  if (!businessId) {
    throw new Error("No business associated with this account");
  }

  // Fetch stats with business filtering
  // const [total, pending, confirmed, revenue, recent] = await Promise.all([
  //   db.booking.count({
  //     where: {
  //       businessId,
  //       deletedAt: null,
  //     },
  //   }),
  //   db.booking.count({
  //     where: {
  //       businessId,
  //       status: "PENDING",
  //       deletedAt: null,
  //     },
  //   }),
  //   db.booking.count({
  //     where: {
  //       businessId,
  //       status: "CONFIRMED",
  //       deletedAt: null,
  //     },
  //   }),
  //   db.booking.aggregate({
  //     _sum: { totalPrice: true },
  //     where: {
  //       businessId,
  //       status: "COMPLETED",
  //       deletedAt: null,
  //     },
  //   }),
  //   db.booking.findMany({
  //     where: {
  //       businessId,
  //       deletedAt: null,
  //     },
  //     orderBy: { createdAt: "desc" },
  //     take: 10,
  //     select: {
  //       id: true,
  //       customerName: true,
  //       serviceName: true,
  //       appointmentDate: true,
  //       status: true,
  //     },
  //   }),
  // ]);

  // // Quick stats for today/this week
  // const today = new Date();
  // today.setHours(0, 0, 0, 0);
  // const weekAgo = new Date();
  // weekAgo.setDate(today.getDate() - 7);
  // const [todayCount, weekCount] = await Promise.all([
  //   db.booking.count({
  //     where: {
  //       businessId,
  //       createdAt: { gte: today },
  //       deletedAt: null,
  //     },
  //   }),
  //   db.booking.count({
  //     where: {
  //       businessId,
  //       createdAt: { gte: weekAgo },
  //       deletedAt: null,
  //     },
  //   }),
  // ]);


  try {
    // Fetch core stats sequentially
    const total = await db.booking.count({
      where: {
        businessId,
        deletedAt: null,
      },
    });

    // const pending = await db.booking.count({
    //   where: {
    //     businessId,
    //     status: "PENDING",
    //     deletedAt: null,
    //   },
    // });

    // const confirmed = await db.booking.count({
    //   where: {
    //     businessId,
    //     status: "CONFIRMED",
    //     deletedAt: null,
    //   },
    // });

    // const revenue = await db.booking.aggregate({
    //   _sum: { totalPrice: true },
    //   where: {
    //     businessId,
    //     status: "COMPLETED",
    //     deletedAt: null,
    //   },
    // });

    const recent = await db.booking.findMany({
      where: {
        businessId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        customerName: true,
        serviceName: true,
        appointmentDate: true,
        status: true,
      },
    });

    // Date-based queries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    const todayCount = await db.booking.count({
      where: {
        businessId,
        createdAt: { gte: today },
        deletedAt: null,
      },
    });

    const weekCount = await db.booking.count({
      where: {
        businessId,
        createdAt: { gte: weekAgo },
        deletedAt: null,
      },
    });
   
    // TODO: check if possible to add caching to reduce database requests

  return (
    <main className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Bookings" value={total} />
        {/* <StatCard label="Pending" value={pending} color="bg-yellow-50" /> */}
        {/* <StatCard label="Confirmed" value={confirmed} color="bg-green-50" /> */}
        {/* <StatCard
          label="Revenue"
          value={`$${revenue._sum.totalPrice?.toLocaleString() ?? 0}`}
          color="bg-blue-50"
        /> */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Bookings</h2>
            <Link
              href="/admin/bookings"
              className="text-blue-600 hover:underline text-sm"
            >
              View All
            </Link>
          </div>
          <div className="rounded-lg bg-white shadow divide-y">
            {recent.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No recent bookings.
              </div>
            ) : (
              recent.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <div className="font-medium">{b.customerName}</div>
                    <div className="text-xs text-gray-500">{b.serviceName}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(b.appointmentDate).toLocaleDateString()}
                  </div>
                  <div className="ml-4 text-xs font-semibold text-blue-600">
                    {b.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quick Stats</h2>
          </div>
          <div className="rounded-lg bg-white shadow p-6 flex flex-col gap-2">
            <div className="flex justify-between">
              <span>Bookings Today</span>
              <span className="font-bold">{todayCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Bookings This Week</span>
              <span className="font-bold">{weekCount}</span>
            </div>
            {/* Placeholder for charts */}
            <div className="mt-4 text-center text-gray-400">
              Charts coming soon...
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex gap-4">
        <Link href="/admin/bookings">
          <button className="rounded bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700">
            View All Bookings
          </button>
        </Link>
        {/* Add more quick actions as needed */}
      </div>
    </main>
  );


    } catch (error) {
    console.error('Dashboard query error:', error);
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Dashboard</h1>
          <p className="text-gray-600 mt-2">Please refresh the page or try again later.</p>
        </div>
      </div>
    );
  }
}
