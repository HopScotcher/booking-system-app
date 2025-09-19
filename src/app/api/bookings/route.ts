// app/api/bookings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth/config";
import { db } from "../../../../lib/db";
import { z } from "zod";
import { bookingSchema } from "@/lib/validations/booking";
import { rateLimit } from "@/lib/rate-limit";
import { BookingStatus, Service } from "@prisma/client";
import { getUserSession } from "../../../../actions/auth";
import { getCurrentUserBusiness } from "../../../../lib/business";

// Rate limiters for different endpoints
const customerLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

const adminLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100,
});

// TODO: IMPLEMENT THE MULTI-TENANCY APPROACH FOR BUSINESS FETCHING TO THIS ROUTE

// POST - Create new booking
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const identifier =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const { success } = await customerLimiter.check(identifier, 5);
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many booking attempts. Please try again later.",
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
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid booking data",
              details: err.issues,
            },
          },
          { status: 400 }
        );
      }
      throw err; // Re-throw if not a Zod error
    }

    // Fetch active business and its services
    const business = await db.business.findFirst({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        services: {
          where: {
            isActive: true,
            deletedAt: null,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BUSINESS_NOT_FOUND",
            message: "No active business found",
          },
        },
        { status: 400 }
      );
    }

    // Find the selected service by ID
    const service = business.services.find(
      (s) => s.id === validatedData.service
    );

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SERVICE_NOT_FOUND",
            message: "Selected service is not available",
          },
        },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await db.booking.create({
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
        confirmationCode: `BK-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      },
      include: {
        business: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

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
          business: booking.business,
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
              message: "This booking already exists",
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

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to create booking",
        },
      },
      { status: 500 }
    );
  }
}

// GET - Admin booking fetching (Phase 3)
export async function GET(req: NextRequest) {
  try {
    // Auth check

    const response = await getUserSession();

    if (
      !response?.user ||
      (response.user.role !== "ADMIN" &&
        response.user.role !== "STAFF" &&
        response.user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized", code: 401 });
    }

    // Rate limiting for admin users
    const identifier =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const { success } = await adminLimiter.check(identifier, 20);

    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50); // Cap at 50
    const status = searchParams.get("status") as BookingStatus | null;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search")?.trim() || "";
    const serviceId = searchParams.get("service") || undefined;

    // Build where clause
    const where: any = {
      deletedAt: null, // Only show non-deleted bookings
    };

    if (status) where.status = status;
    if (serviceId) where.serviceId = serviceId;

    if (dateFrom || dateTo) {
      where.appointmentDate = {};
      if (dateFrom) where.appointmentDate.gte = new Date(dateFrom);
      if (dateTo) where.appointmentDate.lte = new Date(dateTo);
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { confirmationCode: { contains: search, mode: "insensitive" } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const [total, bookings] = await Promise.all([
      db.booking.count({ where }),
      db.booking.findMany({
        where,
        orderBy: { appointmentDate: "desc" },
        skip,
        take: limit,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              price: true,
              duration: true,
            },
          },
          business: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          // user: {
          //   select: {
          //     id: true,
          //     name: true,
          //     email: true,
          //   },
          // },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}

// Method restrictions
export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "PUT method not allowed.",
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
        message: "DELETE method not allowed.",
      },
    },
    { status: 405 }
  );
}
