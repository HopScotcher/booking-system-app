"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookingData } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
} from "lucide-react";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(bookingId);
    } else {
      setError("No booking ID provided");
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`);
      const result = await response.json();

      if (result.success) {
        setBooking(result.data);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError("Failed to fetch booking details");
    } finally {
      setLoading(false);
    }
  };

  const addToCalendar = () => {
    if (!booking) return;

    const startDate = new Date(booking.appointmentDate);
    const [hours, minutes] = booking.appointmentTime.split(":").map(Number);
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + (booking.serviceDuration || 2));

    const event = {
      title: `${booking.serviceName} - SparkleClean`,
      description: `Cleaning service for ${booking.customerName}\nAddress: ${booking.customerAddress}${booking.notes ? `\nNotes: ${booking.notes}` : ""}`,
      location: booking.customerAddress,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    };

    // Create calendar event URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${startDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;

    window.open(googleCalendarUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">
            {error || "Something went wrong"}
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Booking Confirmed!
              </h1>
              <p className="text-sm text-gray-500">
                Your cleaning service is scheduled
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Thank you for your booking!
          </h2>
          <p className="text-lg text-gray-600">
            We've received your request and will confirm shortly
          </p>
        </div>

        {/* Booking Reference */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CardTitle className="text-green-800">Booking Reference</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-mono font-bold text-green-700 mb-2">
              {booking.confirmationCode}
            </div>
            <p className="text-green-600 text-sm">
              Please save this reference number for your records
            </p>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Service Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-medium">{booking.serviceName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">
                  {booking.serviceDuration || 2} hours
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-medium">${booking.servicePrice || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant="secondary" className="capitalize">
                  {booking.status.toLowerCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Appointment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {formatDate(booking.appointmentDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">
                  {formatTime(booking.appointmentTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{booking.duration || 2} hours</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Customer Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{booking.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{booking.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{booking.customerPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{booking.customerAddress}</p>
              </div>
            </div>
            {booking.notes && (
              <div>
                <p className="text-sm text-gray-500">Additional Notes</p>
                <p className="font-medium">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <h4 className="font-semibold text-lg mb-2">
                {booking.business.name}
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{booking.business.email}</p>
                <p>{booking.business.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-700">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  We'll send you a confirmation email within the next few
                  minutes
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  Our team will review your booking and confirm the appointment
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  You'll receive a reminder 24 hours before your scheduled
                  service
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  Our professional cleaning team will arrive at the scheduled
                  time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={addToCalendar}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <Calendar className="w-4 h-4" />
            <span>Add to Calendar</span>
          </Button>

          <Button variant="outline" onClick={() => window.print()}>
            Print Confirmation
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2024 {booking.business.name}. All rights reserved.</p>
            <p className="mt-1">Thank you for choosing our services!</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
