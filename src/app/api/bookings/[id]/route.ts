// app/api/boookings/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth/config";
import { db } from "../../../../../lib/db";
import { BookingStatus } from "@prisma/client";

// GET: Fetch booking details by ID (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "MISSING_ID", message: "Booking ID is required" },
        },
        { status: 400 }
      );
    }

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        business: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BOOKING_NOT_FOUND", message: "Booking not found" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        confirmationCode: booking.confirmationCode,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        customerAddress: booking.customerAddress,
        serviceName: booking.serviceName,
        servicePrice: booking.servicePrice,
        serviceDuration: booking.serviceDuration,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        duration: booking.duration,
        totalPrice: booking.totalPrice,
        notes: booking.notes,
        status: booking.status,
        business: booking.business,
        createdAt: booking.createdAt,
      },
      message: "Booking details retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "DATABASE_ERROR", message: "Failed to retrieve booking details" },
      },
      { status: 500 }
    );
  }
}

// PATCH: Update booking status by ID (admin/staff only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "ADMIN" &&
        session.user.role !== "STAFF" &&
        session.user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unauthorized" },
        },
        { status: 401 }
      );
    }

    const bookingId = params.id;
    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "MISSING_ID", message: "Booking ID is required" },
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body;
    if (!status || !Object.values(BookingStatus).includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_STATUS", message: "Invalid or missing status value" },
        },
        { status: 400 }
      );
    }

    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BOOKING_NOT_FOUND", message: "Booking not found" },
        },
        { status: 404 }
      );
    }

    const updated = await db.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        business: { select: { name: true, email: true, phone: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        confirmationCode: updated.confirmationCode,
        customerName: updated.customerName,
        customerEmail: updated.customerEmail,
        customerPhone: updated.customerPhone,
        customerAddress: updated.customerAddress,
        serviceName: updated.serviceName,
        servicePrice: updated.servicePrice,
        serviceDuration: updated.serviceDuration,
        appointmentDate: updated.appointmentDate,
        appointmentTime: updated.appointmentTime,
        duration: updated.duration,
        totalPrice: updated.totalPrice,
        notes: updated.notes,
        status: updated.status,
        business: updated.business,
        createdAt: updated.createdAt,
      },
      message: "Booking status updated successfully",
    });
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "DATABASE_ERROR", message: "Failed to update booking" },
      },
      { status: 500 }
    );
  }
}