/**
 * API Route: Get all acolytes (Admin)
 * GET /api/admin/acolytes
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireRole } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { authorized, session } = await requireRole("coordinador");

    if (!authorized || !session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    // Obtener todos los acólitos
    const acolytes = await prisma.users.findMany({
      where: {
        role: "acolito",
      },
      select: {
        user_id: true,
        full_name: true,
        email: true,
        created_at: true,
        event_assignments_event_assignments_acolyte_idTousers: {
          select: {
            assignment_id: true,
            status: true,
            attendance_status: true,
            events: {
              select: {
                event_id: true,
                title: true,
                event_datetime: true,
              },
            },
          },
        },
      },
      orderBy: {
        full_name: "asc",
      },
    });

    return NextResponse.json(
      {
        acolytes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error obteniendo acólitos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
