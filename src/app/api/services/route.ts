// src/app/api/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "../../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    // For now, return all active services without business filtering
    const services = await db.service.findMany({
      where: { isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        // Exclude sensitive business data
      },
    });

    // Transform duration from minutes to hours
    const servicesWithHours = services.map((service) => ({
      ...service,
      duration: service.duration / 60, // Convert minutes to hours
    }));

    return NextResponse.json({
      success: true,
      data: servicesWithHours,
      message: "Services retrieved successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve services",
        },
      },
      { status: 500 }
    );
  }
}
