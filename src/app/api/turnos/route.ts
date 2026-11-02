import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { turnoSchema } from "@/lib/validations";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");
    const puestoId = searchParams.get("puestoId");

    const whereClause: Record<string, unknown> = {};
    if (fecha) {
      whereClause.fecha = fecha;
    }
    if (puestoId && puestoId !== "TODOS") {
      whereClause.puestoId = puestoId;
    }

    const turnos = await prisma.turnoProgramacion.findMany({
      where: whereClause,
      include: {
        vigilante: true,
        puesto: true,
        creadoPor: {
          select: { nombre: true, rol: true },
        },
      },
      orderBy: [{ fecha: "desc" }, { horaInicio: "asc" }],
    });

    return NextResponse.json({ turnos });
  } catch (error) {
    console.error("Error consultando turnos:", error);
    return NextResponse.json(
      { error: "Error al consultar la programación de turnos" },
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
    const parsed = turnoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verificar que el vigilante esté activo
    const vigilante = await prisma.vigilante.findUnique({
      where: { id: data.vigilanteId },
    });

    if (!vigilante || vigilante.eliminado) {
      return NextResponse.json(
        { error: "El vigilante seleccionado no existe o fue dado de baja" },
        { status: 400 }
      );
    }

    if (vigilante.estado !== "ACTIVO" && data.tipoTurno !== "DESCANSO") {
      return NextResponse.json(
        {
          error: `No se puede programar turno operativo a ${vigilante.nombres} ${vigilante.apellidos} porque su estado actual es ${vigilante.estado}`,
        },
        { status: 400 }
      );
    }

    // Evitar doble asignación en la misma fecha y horario
    const turnoConflicto = await prisma.turnoProgramacion.findFirst({
      where: {
        vigilanteId: data.vigilanteId,
        fecha: data.fecha,
        tipoTurno: data.tipoTurno,
      },
      include: { puesto: true },
    });

    if (turnoConflicto) {
      return NextResponse.json(
        {
          error: `El vigilante ya tiene asignado un turno ${data.tipoTurno} el día ${data.fecha} en ${turnoConflicto.puesto.nombre}`,
        },
        { status: 409 }
      );
    }

    const nuevo = await prisma.turnoProgramacion.create({
      data: {
        vigilanteId: data.vigilanteId,
        puestoId: data.puestoId,
        fecha: data.fecha,
        tipoTurno: data.tipoTurno,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        observaciones: data.observaciones || null,
        creadoPorId: user.id,
      },
      include: {
        vigilante: true,
        puesto: true,
      },
    });

    return NextResponse.json(
      { turno: nuevo, message: "Turno programado exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error programando turno:", error);
    return NextResponse.json(
      { error: "Error al registrar el turno" },
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
      return NextResponse.json({ error: "ID de turno requerido" }, { status: 400 });
    }

    await prisma.turnoProgramacion.delete({ where: { id } });
    return NextResponse.json({ message: "Turno eliminado de la planilla" });
  } catch (error) {
    console.error("Error eliminando turno:", error);
    return NextResponse.json(
      { error: "Error al eliminar el turno" },
      { status: 500 }
    );
  }
}

