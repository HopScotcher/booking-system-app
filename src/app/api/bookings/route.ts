import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "../../../../lib/db";
import { z } from "zod";
import { bookingSchema } from "@/lib/validations/booking";
import { rateLimit } from "@/lib/rate-limit";
import { BookingStatus, Service } from "@prisma/client";

// Rate limiters for different endpoints
const customerLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

const adminLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute  
  uniqueTokenPerInterval: 100,
});

// POST - Public booking creation (Phase 2)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting for customers
    const identifier =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      request.ip ??
      "anonymous";
    
    const { success } = await customerLimiter.check(identifier, 5);

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
    const business = await db.business.findFirst({
      where: { isActive: true, deletedAt: null },
      include: { services: { where: { isActive: true, deletedAt: null } } },
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
      MOVE_IN_OUT_CLEANING: "Move-in/Move-out Cleaning",
    };

    const serviceName = serviceMapping[validatedData.service as keyof typeof serviceMapping];
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

// GET - Admin booking fetching (Phase 3)
export async function GET(req: NextRequest) {
  try {
    // Rate limiting for admin users
    const identifier = 
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      req.ip ??
      "unknown";
    
    const { success } = await adminLimiter.check(identifier, 20);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" }, 
        { status: 429 }
      );
    }

    // Auth check
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "ADMIN" && 
       session.user.role !== "STAFF" && 
       session.user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
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
            }
          }, 
          business: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            }
          }, 
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
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
        }
      }
    });
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch bookings" 
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