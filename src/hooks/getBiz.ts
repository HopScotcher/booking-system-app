"use server"

import { db } from "../../lib/db";

export async function GetBiz(){
    
    const business = await db.business.findFirst({
        where: { isActive: true, deletedAt: null },
        include: { services: { where: { isActive: true, deletedAt: null } } },
    });
    
     return business
}