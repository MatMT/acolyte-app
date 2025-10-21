/**
 * API Route: Login
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // En producción, usa bcrypt para comparar el hash
    // const isValidPassword = await bcrypt.compare(password, user.password_hash);
    // Por ahora, comparación directa (NO USAR EN PRODUCCIÓN)
    if (password !== user.password_hash) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Crear sesión
    const session = await createSession(user.user_id);

    return NextResponse.json(
      {
        message: "Login exitoso",
        user: {
          id: user.user_id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en login:", error);
    
    // Si es un error de Prisma, dar más detalles
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: "Error al iniciar sesión",
          details: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
