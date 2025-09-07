import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_ID",
            message: "Booking ID is required",
          },
        },
        { status: 400 }
      )
    }

    // Fetch booking from database
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BOOKING_NOT_FOUND",
            message: "Booking not found",
          },
        },
        { status: 404 }
      )
    }

    // Return booking details
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
    })

  } catch (error) {
    console.error("Error fetching booking:", error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to retrieve booking details",
        },
      },
      { status: 500 }
    )
  }
}



