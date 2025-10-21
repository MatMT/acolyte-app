/**
 * API Route: Test database connection
 * GET /api/test/db
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Intentar contar usuarios
    const userCount = await prisma.users.count();
    
    // Obtener los primeros 5 usuarios
    const users = await prisma.users.findMany({
      take: 5,
      select: {
        user_id: true,
        full_name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      {
        message: "Conexión exitosa a la base de datos",
        userCount,
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en test de DB:", error);
    return NextResponse.json(
      { 
        error: "Error al conectar con la base de datos",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
