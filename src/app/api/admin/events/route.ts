/**
 * API Route: Get all events (Admin)
 * GET /api/admin/events - Get all events
 * POST /api/admin/events - Create new event
 */

import { NextRequest, NextResponse } from "next/server";
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

    const events = await prisma.events.findMany({
      include: {
        users: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
          },
        },
        event_assignments: {
          include: {
            users_event_assignments_acolyte_idTousers: {
              select: {
                user_id: true,
                full_name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        event_datetime: "desc",
      },
    });

    return NextResponse.json(
      {
        events,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error obteniendo eventos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, session } = await requireRole("coordinador");

    if (!authorized || !session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { title, type, description, event_datetime } = await request.json();

    // Validar campos requeridos
    if (!title || !type || !event_datetime) {
      return NextResponse.json(
        { error: "Título, tipo y fecha son requeridos" },
        { status: 400 }
      );
    }

    // Validar tipo de evento
    if (type !== "solemne" && type !== "ordinaria") {
      return NextResponse.json(
        { error: "Tipo de evento inválido" },
        { status: 400 }
      );
    }

    // Crear evento
    const event = await prisma.events.create({
      data: {
        title,
        type,
        description,
        event_datetime: new Date(event_datetime),
        created_by_id: session.userId,
      },
      include: {
        users: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Evento creado exitosamente",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando evento:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
