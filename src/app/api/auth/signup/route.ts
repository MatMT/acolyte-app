/**
 * API Route: Signup
 * POST /api/auth/signup
 */

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, role } = await request.json();

    // Validar campos requeridos
    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar rol
    if (role !== "coordinador" && role !== "acolito") {
      return NextResponse.json(
        { error: "Rol inválido" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 409 }
      );
    }

    // En producción, usa bcrypt para hashear la contraseña
    // const password_hash = await bcrypt.hash(password, 10);
    // Por ahora, guardamos el password directamente (NO USAR EN PRODUCCIÓN)
    const password_hash = password;

    // Crear usuario
    const user = await prisma.users.create({
      data: {
        full_name: fullName,
        email,
        password_hash,
        role,
      },
    });

    // Crear sesión automáticamente
    await createSession(user.user_id);

    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user: {
          id: user.user_id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en signup:", error);
    
    // Si es un error de Prisma, dar más detalles
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: "Error al crear usuario",
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
