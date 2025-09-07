import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { bookingSchema } from "@/lib/validations/booking";
import { rateLimit } from "@/lib/rate-limit";
import { Service } from "@/generated/prisma";

const prisma = new PrismaClient();

// Rate limiting: max 5 requests per IP per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const identifier =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";
    const { success } = await limiter.check(identifier, 5);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
          },
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    let validatedData;
    try {
      validatedData = bookingSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid request data",
              details: error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Invalid JSON payload",
          },
        },
        { status: 400 }
      );
    }

    // Get the business and service from database
    const business = await prisma.business.findFirst({
      where: { isActive: true },
      include: { services: { where: { isActive: true } } },
    });

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_BUSINESS_FOUND",
            message: "No active business found",
          },
        },
        { status: 400 }
      );
    }

    // Map service enum to database service
    const serviceMapping = {
      BASIC_CLEANING: "Basic House Cleaning",
      DEEP_CLEANING: "Deep Cleaning Service",
      MOVE_IN_OUT_CLEANING: "Office Space Cleaning", // Using office cleaning as fallback
    };

    const serviceName = serviceMapping[validatedData.service];
    const service = business.services.find(
      (s: Service) => s.name === serviceName
    );

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SERVICE",
            message: "Selected service not found in database",
          },
        },
        { status: 400 }
      );
    }

    // Create booking in database
    const booking = await prisma.booking.create({
      data: {
        businessId: business.id,
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        customerPhone: validatedData.customerPhone,
        customerAddress: validatedData.address,
        appointmentDate: validatedData.date,
        appointmentTime: validatedData.time,
        duration: service.duration,
        totalPrice: service.price,
        notes: validatedData.notes,
        status: "PENDING",
        confirmationCode: `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          id: booking.id,
          confirmationCode: booking.confirmationCode,
          customerName: booking.customerName,
          serviceName: booking.serviceName,
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          status: booking.status,
        },
        message: "Booking created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation error:", error);

    // Handle Prisma-specific errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DUPLICATE_BOOKING",
              message: "A booking with these details already exists",
            },
          },
          { status: 409 }
        );
      }

      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_REFERENCE",
              message: "Invalid business or service reference",
            },
          },
          { status: 400 }
        );
      }
    }

    // Generic database error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to create booking. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "GET method not allowed. Use POST to create a booking.",
      },
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "PUT method not allowed. Use POST to create a booking.",
      },
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "DELETE method not allowed. Use POST to create a booking.",
      },
    },
    { status: 405 }
  );
}
