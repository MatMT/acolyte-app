/**
 * API Route: Manage event assignments (Admin)
 * POST /api/admin/assignments - Create new assignment
 * PATCH /api/admin/assignments/[id] - Update assignment status
 */

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireRole } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { authorized, session } = await requireRole("coordinador");

    if (!authorized || !session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { event_id, acolyte_id } = await request.json();

    // Validar campos requeridos
    if (!event_id || !acolyte_id) {
      return NextResponse.json(
        { error: "ID de evento y acólito son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el evento existe
    const event = await prisma.events.findUnique({
      where: { event_id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el acólito existe
    const acolyte = await prisma.users.findUnique({
      where: { user_id: acolyte_id, role: "acolito" },
    });

    if (!acolyte) {
      return NextResponse.json(
        { error: "Acólito no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que no exista una asignación activa
    const existingAssignment = await prisma.event_assignments.findFirst({
      where: {
        event_id,
        acolyte_id,
        status: {
          in: ["asignado", "reemplazo_aceptado"],
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "El acólito ya está asignado a este evento" },
        { status: 409 }
      );
    }

    // Crear asignación
    const assignment = await prisma.event_assignments.create({
      data: {
        event_id,
        acolyte_id,
        status: "asignado",
      },
      include: {
        events: true,
        users_event_assignments_acolyte_idTousers: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    // Crear notificación para el acólito
    await prisma.notifications.create({
      data: {
        recipient_id: acolyte_id,
        message: `Has sido asignado al evento: ${event.title}`,
        related_event_id: event_id,
      },
    });

    return NextResponse.json(
      {
        message: "Asignación creada exitosamente",
        assignment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando asignación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
