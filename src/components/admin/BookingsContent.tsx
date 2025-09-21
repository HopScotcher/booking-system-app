"use client";

import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Booking, Service } from "@prisma/client";
import BookingFilters from "./BookingFilters";
import BookingsTable from "./BookingsTable";

export function BookingsContent() {
  // const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        fetch("/api/bookings", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/services", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

      const bookingsJson = await bookingsRes.json();
      const servicesJson = await servicesRes.json();

      if (!bookingsRes.ok || !bookingsJson.success) {
        throw new Error(
          bookingsJson.error?.message || "Failed to fetch bookings"
        );
      }
      if (!servicesRes.ok || !servicesJson.success) {
        throw new Error(
          servicesJson.error?.message || "Failed to fetch services"
        );
      }

      setBookings(bookingsJson.data.bookings || []);
      setServices(servicesJson.data || []);
    } catch (error: any) {
      toast.error(error.message || "An error occurred while fetching data");
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

    fetchData();

  // useEffect(() => {
  //   if (session) {
    
  //   }
  // }, [session]);

  // if (!session) {
  //   return null; // Middleware will handle the redirect
  // }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <BookingFilters services={services} onApply={fetchData} />
      <div className="mt-8">
        <BookingsTable bookings={bookings} />
      </div>
    </>
  );
}
