import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { puestoSchema } from "@/lib/validations";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const puestos = await prisma.puestoTrabajo.findMany({
      orderBy: { codigo: "asc" },
      include: {
        _count: {
          select: { turnos: true },
        },
      },
    });
    return NextResponse.json({ puestos });
  } catch (error) {
    console.error("Error consultando puestos:", error);
    return NextResponse.json(
      { error: "Error al cargar puestos de trabajo" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = puestoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existente = await prisma.puestoTrabajo.findUnique({
      where: { codigo: data.codigo },
    });

    if (existente) {
      return NextResponse.json(
        { error: `El código de puesto ${data.codigo} ya existe` },
        { status: 409 }
      );
    }

    const nuevo = await prisma.puestoTrabajo.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        direccion: data.direccion,
        ciudad: data.ciudad,
        contactoCliente: data.contactoCliente || null,
        telefonoCliente: data.telefonoCliente || null,
        requiereArma: data.requiereArma,
        activo: data.activo,
      },
    });

    return NextResponse.json(
      { puesto: nuevo, message: "Puesto de trabajo creado exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando puesto:", error);
    return NextResponse.json(
      { error: "Error al crear el puesto de trabajo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.rol !== "ADMIN") {
      return NextResponse.json(
        { error: "Solo un Administrador puede eliminar puestos de trabajo" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    await prisma.puestoTrabajo.delete({ where: { id } });
    return NextResponse.json({ message: "Puesto de trabajo eliminado" });
  } catch (error) {
    console.error("Error eliminando puesto:", error);
    return NextResponse.json(
      { error: "Error al eliminar el puesto de trabajo" },
      { status: 500 }
    );
  }
}

