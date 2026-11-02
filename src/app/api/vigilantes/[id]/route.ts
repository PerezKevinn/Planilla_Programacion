import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vigilanteSchema } from "@/lib/validations";
import { getSessionUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar colisión de documento con otro vigilante distinto
    const duplicado = await prisma.vigilante.findFirst({
      where: {
        documento: data.documento,
        NOT: { id: params.id },
      },
    });

    if (duplicado) {
      return NextResponse.json(
        {
          error: `Otro vigilante ya tiene asignado el documento ${data.documento}`,
        },
        { status: 409 }
      );
    }

    const actualizado = await prisma.vigilante.update({
      where: { id: params.id },
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
      include: {
        certificaciones: {
          orderBy: { fechaVencimiento: "asc" },
        },
      },
    });

    return NextResponse.json({
      vigilante: actualizado,
      message: "Información del vigilante actualizada",
    });
  } catch (error) {
    console.error("Error actualizando vigilante:", error);
    return NextResponse.json(
      { error: "Error al actualizar la información del vigilante" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (user.rol !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Permiso denegado: Solo un Administrador puede eliminar vigilantes.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const definitivo = searchParams.get("definitivo") === "true";

    if (definitivo) {
      await prisma.vigilante.delete({
        where: { id: params.id },
      });
      return NextResponse.json({
        message: "Vigilante eliminado permanentemente de la base de datos",
      });
    } else {
      await prisma.vigilante.update({
        where: { id: params.id },
        data: { eliminado: true, estado: "INACTIVO" },
      });
      return NextResponse.json({
        message: "Vigilante dado de baja y archivado de forma segura",
      });
    }
  } catch (error) {
    console.error("Error eliminando vigilante:", error);
    return NextResponse.json(
      { error: "Error al eliminar el vigilante" },
      { status: 500 }
    );
  }
}

