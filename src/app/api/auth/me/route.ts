/**
 * API Route: Get current user
 * GET /api/auth/me
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        user: session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
