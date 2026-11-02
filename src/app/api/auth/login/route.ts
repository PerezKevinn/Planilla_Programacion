import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || !usuario.activo) {
      return NextResponse.json(
        { error: "Credenciales incorrectas o cuenta inactiva" },
        { status: 401 }
      );
    }

    const passwordValido = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValido) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: (usuario.rol === "ADMIN" ? "ADMIN" : "SUPERVISOR") as
        | "ADMIN"
        | "SUPERVISOR",
    };

    const token = await createSessionToken(sessionUser);

    const response = NextResponse.json({
      user: sessionUser,
      message: "Inicio de sesión exitoso",
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 horas
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

