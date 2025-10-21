/**
 * API Route: Public test database connection
 * GET /api/public/test-db
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Intentar contar usuarios
    const userCount = await prisma.users.count();
    
    // Verificar conexión
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        message: "✅ Conexión exitosa a la base de datos",
        status: "connected",
        userCount,
        database: "PostgreSQL",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en test de DB:", error);
    return NextResponse.json(
      { 
        message: "❌ Error al conectar con la base de datos",
        status: "error",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
