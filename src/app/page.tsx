import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Users,
  UserCheck,
  Building2,
  CalendarClock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const hoyStr = new Date().toISOString().split("T")[0];

  const [vigilantes, puestosCount, turnosHoy] = await Promise.all([
    prisma.vigilante.findMany({
      where: { eliminado: false },
      include: { certificaciones: true },
    }),
    prisma.puestoTrabajo.count({ where: { activo: true } }),
    prisma.turnoProgramacion.findMany({
      where: { fecha: hoyStr },
      include: {
        vigilante: true,
        puesto: true,
      },
      orderBy: { horaInicio: "asc" },
    }),
  ]);

  const activos = vigilantes.filter((v) => v.estado === "ACTIVO").length;
  const novedades = vigilantes.filter(
    (v) => v.estado === "VACACIONES" || v.estado === "INCAPACIDAD"
  ).length;

  // Calcular alertas de certificaciones (vencidas o por vencer en <= 30 días)
  const ahora = new Date().getTime();
  const alertasCertificaciones: Array<{
    id: string;
    vigilanteNombre: string;
    documento: string;
    tipo: string;
    fechaVencimiento: Date;
    diasRestantes: number;
  }> = [];

  for (const v of vigilantes) {
    for (const c of v.certificaciones) {
      const diffDias = Math.ceil(
        (new Date(c.fechaVencimiento).getTime() - ahora) / (1000 * 60 * 60 * 24)
      );
      if (diffDias <= 30) {
        alertasCertificaciones.push({
          id: c.id,
          vigilanteNombre: `${v.nombres} ${v.apellidos}`,
          documento: v.documento,
          tipo: c.tipo,
          fechaVencimiento: c.fechaVencimiento,
          diasRestantes: diffDias,
        });
      }
    }
  }

  alertasCertificaciones.sort((a, b) => a.diasRestantes - b.diasRestantes);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Panel de Control Operativo
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Resumen general de la base de datos de vigilantes, alertas de
            documentación y programación del día ({hoyStr}).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/vigilantes"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Gestionar Vigilantes
          </Link>
          <Link
            href="/programacion"
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <CalendarClock className="w-4 h-4" />
            Planilla de Turnos
          </Link>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total Vigilantes Registrados
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900">
            {vigilantes.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            En base de datos activa
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Disponibles / Activos
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-600">
            {activos}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {novedades} en vacaciones o incapacidad
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Puestos de Trabajo Activos
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900">
            {puestosCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Sedes y clientes configurados
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Alertas de Cursos / Licencias
            </span>
            <div
              className={`p-2.5 rounded-lg ${alertasCertificaciones.length > 0
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600"
                }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-amber-600">
            {alertasCertificaciones.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Vencidos o por vencer en 30 días
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de certificaciones */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h2 className="font-semibold text-slate-900">
                Alertas de Cursos y Licencias
              </h2>
            </div>
            <Link
              href="/vigilantes"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6">
            {alertasCertificaciones.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  Toda la documentación está vigente
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Ningún vigilante tiene cursos o permisos vencidos o próximos a
                  vencer.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertasCertificaciones.map((alerta) => {
                  const vencido = alerta.diasRestantes < 0;
                  return (
                    <div
                      key={alerta.id}
                      className={`p-3.5 rounded-lg border flex items-start justify-between gap-4 ${vencido
                          ? "bg-red-50/70 border-red-200"
                          : "bg-amber-50/70 border-amber-200"
                        }`}
                    >
                      <div>
                        <div className="font-semibold text-sm text-slate-900">
                          {alerta.vigilanteNombre}{" "}
                          <span className="text-xs font-normal text-slate-500">
                            (Doc: {alerta.documento})
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 mt-0.5 font-medium">
                          {alerta.tipo}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Vencimiento:{" "}
                          {
                            new Date(alerta.fechaVencimiento)
                              .toISOString()
                              .split("T")[0]
                          }
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${vencido
                            ? "bg-red-600 text-white"
                            : "bg-amber-500 text-white"
                          }`}
                      >
                        {vencido
                          ? `Vencido hace ${Math.abs(alerta.diasRestantes)} d`
                          : `Vence en ${alerta.diasRestantes} d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Turnos de hoy */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-slate-900">
                Turnos Programados Hoy ({hoyStr})
              </h2>
            </div>
            <Link
              href="/programacion"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ir a Planilla <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6">
            {turnosHoy.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CalendarClock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  Sin turnos programados para hoy
                </p>
                <Link
                  href="/programacion"
                  className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:underline"
                >
                  + Programar turnos ahora
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {turnosHoy.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900">
                        {t.vigilante.nombres} {t.vigilante.apellidos}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Puesto: <strong>{t.puesto.nombre}</strong> (
                        {t.puesto.codigo})
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${t.tipoTurno === "DIURNO"
                            ? "bg-sky-100 text-sky-800"
                            : t.tipoTurno === "NOCTURNO"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                      >
                        {t.tipoTurno}
                      </span>
                      <div className="text-xs text-slate-500 mt-1">
                        {t.horaInicio} - {t.horaFin}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

