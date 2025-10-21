/**
 * API Route: Get acolyte assignments
 * GET /api/acolyte/assignments
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireRole } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { authorized, session } = await requireRole("acolito");

    if (!authorized || !session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    // Obtener asignaciones del acólito
    const assignments = await prisma.event_assignments.findMany({
      where: {
        acolyte_id: session.userId,
      },
      include: {
        events: {
          select: {
            event_id: true,
            title: true,
            type: true,
            description: true,
            event_datetime: true,
          },
        },
      },
      orderBy: {
        events: {
          event_datetime: "asc",
        },
      },
    });

    // Formatear respuesta
    const formattedAssignments = assignments.map((assignment) => ({
      assignment_id: assignment.assignment_id,
      event: assignment.events,
      status: assignment.status,
      attendance_status: assignment.attendance_status,
      created_at: assignment.created_at,
    }));

    return NextResponse.json(
      {
        assignments: formattedAssignments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error obteniendo asignaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
