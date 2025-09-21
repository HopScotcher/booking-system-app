import { Metadata } from "next";
import { BookingForm } from "@/components/booking/BookingForm";
import { getBusinessBySlug } from "../../../lib/business";
import { notFound } from "next/navigation";

// import { useCreateBooking } from "@/hooks/useBooking";
// import { useMutation } from "@tanstack/react-query";

export const metadata: Metadata = {
  title: "Book Your Cleaning Service | SparkleClean",
  description:
    "Schedule your professional cleaning service with SparkleClean. Choose from our range of cleaning services and book your appointment online.",
  keywords:
    "cleaning service, house cleaning, professional cleaning, book cleaning, online booking",
  openGraph: {
    title: "Book Your Cleaning Service | SparkleClean",
    description:
      "Schedule your professional cleaning service with SparkleClean. Choose from our range of cleaning services and book your appointment online.",
    type: "website",
    locale: "en_US",
  },
};

interface BookingPageProps {
  searchParams: { business?: string };
}
export default async function BookPage({ searchParams }: BookingPageProps) {
  const businessSlug = searchParams.business;

  console.log(businessSlug);

  if (!businessSlug) {
    notFound();
  }

  const business = await getBusinessBySlug(businessSlug);

  if (!business) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Company Branding */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Dorshee House Cleaning Services
                </h1>
                <p className="text-sm text-gray-500">
                  Professional Cleaning Services
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="hidden sm:block text-right">
              <p className="text-sm text-gray-600">Need help?</p>
              <p className="text-sm font-medium text-gray-900">
                +1 (555) CLEAN-01
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Book Your Cleaning Service
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your service, pick a convenient time, and we'll take care of
            the rest. Professional cleaning delivered with care and attention to
            detail.
          </p>
        </div>

        {/* Booking Form Container */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2">
                  Schedule Your Appointment
                </h3>
                <p className="text-blue-100">
                  Complete the form below to book your cleaning service
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 sm:p-8">
              {/* TODO: modify the booking form to accept the props */}
              <BookingForm business={business} services={business.services} />
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Professional Service
              </h4>
              <p className="text-sm text-gray-600">
                Trained and certified cleaners
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Flexible Scheduling
              </h4>
              <p className="text-sm text-gray-600">Book at your convenience</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Satisfaction Guaranteed
              </h4>
              <p className="text-sm text-gray-600">
                100% customer satisfaction
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2025 SparkleClean. All rights reserved.</p>
            <p className="mt-1">
              Professional cleaning services for homes and offices
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
