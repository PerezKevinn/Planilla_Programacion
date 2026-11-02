import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vigilanteSchema } from "@/lib/validations";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const estado = searchParams.get("estado") || "TODOS";
    const cargo = searchParams.get("cargo") || "TODOS";

    const whereClause: Record<string, unknown> = {
      eliminado: false,
    };

    if (estado !== "TODOS") {
      whereClause.estado = estado;
    }

    if (cargo !== "TODOS") {
      whereClause.cargo = cargo;
    }

    if (q) {
      whereClause.OR = [
        { documento: { contains: q } },
        { nombres: { contains: q } },
        { apellidos: { contains: q } },
        { telefono: { contains: q } },
      ];
    }

    const vigilantes = await prisma.vigilante.findMany({
      where: whereClause,
      include: {
        certificaciones: {
          orderBy: { fechaVencimiento: "asc" },
        },
        _count: {
          select: { turnos: true },
        },
      },
      orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
    });

    return NextResponse.json({ vigilantes });
  } catch (error) {
    console.error("Error consultando vigilantes:", error);
    return NextResponse.json(
      { error: "Error al consultar los vigilantes" },
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
    const parsed = vigilanteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verificar si ya existe un vigilante con ese documento
    const existente = await prisma.vigilante.findUnique({
      where: { documento: data.documento },
    });

    if (existente) {
      if (existente.eliminado) {
        // Reactivar si estaba archivado (soft-deleted)
        const reactivado = await prisma.vigilante.update({
          where: { id: existente.id },
          data: {
            nombres: data.nombres,
            apellidos: data.apellidos,
            telefono: data.telefono,
            email: data.email || null,
            direccion: data.direccion || null,
            tipoSangre: data.tipoSangre,
            contactoEmergencia: data.contactoEmergencia || null,
            telefonoEmergencia: data.telefonoEmergencia || null,
            cargo: data.cargo,
            tipoContrato: data.tipoContrato,
            fechaIngreso: new Date(data.fechaIngreso),
            estado: data.estado,
            observaciones: data.observaciones || null,
            eliminado: false,
          },
          include: { certificaciones: true },
        });
        return NextResponse.json({
          vigilante: reactivado,
          message: "Vigilante reactivado y actualizado exitosamente",
        });
      }

      return NextResponse.json(
        {
          error: `Ya existe un vigilante registrado con el documento ${data.documento}`,
        },
        { status: 409 }
      );
    }

    const nuevo = await prisma.vigilante.create({
      data: {
        documento: data.documento,
        nombres: data.nombres,
        apellidos: data.apellidos,
        telefono: data.telefono,
        email: data.email || null,
        direccion: data.direccion || null,
        tipoSangre: data.tipoSangre,
        contactoEmergencia: data.contactoEmergencia || null,
        telefonoEmergencia: data.telefonoEmergencia || null,
        cargo: data.cargo,
        tipoContrato: data.tipoContrato,
        fechaIngreso: new Date(data.fechaIngreso),
        estado: data.estado,
        observaciones: data.observaciones || null,
      },
      include: { certificaciones: true },
    });

    return NextResponse.json(
      { vigilante: nuevo, message: "Vigilante registrado exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando vigilante:", error);
    return NextResponse.json(
      { error: "Error interno al guardar el vigilante" },
      { status: 500 }
    );
  }
}

