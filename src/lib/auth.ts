/**
 * Librería de autenticación
 * Maneja la lógica de autenticación, sesiones y validación de roles
 */

import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface Session {
  userId: number;
  email: string;
  role: "coordinador" | "acolito";
  fullName: string;
}

/**
 * Obtiene la sesión actual del usuario desde las cookies
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    // Decodificar el token de sesión (en producción usa JWT)
    const sessionData = JSON.parse(
      Buffer.from(sessionToken, "base64").toString()
    );

    // Verificar que el usuario aún existe en la base de datos
    const user = await prisma.users.findUnique({
      where: { user_id: sessionData.userId },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    };
  } catch (error) {
    console.error("Error parsing session:", error);
    return null;
  }
}

/**
 * Crea una sesión para el usuario
 */
export async function createSession(userId: number) {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const session: Session = {
    userId: user.user_id,
    email: user.email,
    role: user.role,
    fullName: user.full_name,
  };

  // Crear token de sesión (en producción usa JWT con firma)
  const sessionToken = Buffer.from(JSON.stringify(session)).toString("base64");

  const cookieStore = await cookies();
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });

  return session;
}

/**
 * Destruye la sesión del usuario
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function requireRole(role: "coordinador" | "acolito") {
  const session = await getSession();

  if (!session) {
    return { authorized: false, session: null };
  }

  if (session.role !== role) {
    return { authorized: false, session };
  }

  return { authorized: true, session };
}

/**
 * Verifica si el usuario está autenticado
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    return { authorized: false, session: null };
  }

  return { authorized: true, session };
}
