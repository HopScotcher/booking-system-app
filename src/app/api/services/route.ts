// src/app/api/services/route.ts
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth/config";
import { db } from "../../../../lib/db";
// import { getUserSession } from "@/app/(auth)/login/actions";
import { getUserSession } from "../../../../actions/auth";
import { createClient } from "../../../../lib/supabase/server";
import { getUserBusinessId } from "../../../../lib/business";

export async function GET(request: NextRequest) {

  
  try {
    const supabase = await createClient()
    const {data: {user}, error} = await supabase.auth.getUser()

    if(error || !user){
      return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const businessId = await getUserBusinessId(user.email!)

    if(!businessId){
      return NextResponse.json({error: "Business not found"}, {status: 404})
    }
    // For now, return all active services without business filtering
    const services = await db.service.findMany({
      where: {businessId, isActive: true, deletedAt: null },
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
