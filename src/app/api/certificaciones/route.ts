import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { certificacionSchema } from "@/lib/validations";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = certificacionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const nueva = await prisma.certificacion.create({
      data: {
        vigilanteId: data.vigilanteId,
        tipo: data.tipo,
        entidad: data.entidad || null,
        numeroCredencial: data.numeroCredencial || null,
        fechaExpedicion: new Date(data.fechaExpedicion),
        fechaVencimiento: new Date(data.fechaVencimiento),
      },
    });

    return NextResponse.json(
      { certificacion: nueva, message: "Certificación agregada correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando certificación:", error);
    return NextResponse.json(
      { error: "Error al registrar la certificación" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    await prisma.certificacion.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Certificación eliminada" });
  } catch (error) {
    console.error("Error eliminando certificación:", error);
    return NextResponse.json(
      { error: "Error al eliminar la certificación" },
      { status: 500 }
    );
  }
}

