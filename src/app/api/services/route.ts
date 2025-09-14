// src/app/api/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "../../../../lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const businessId = session?.user?.businessId;
  if (!businessId) {
    return NextResponse.json({ success: false, error: "No business found" }, { status: 401 });
  }

  const services = await db.service.findMany({
    where: { businessId, isActive: true, deletedAt: null },
  });

  return NextResponse.json({ success: true, data: services });
}