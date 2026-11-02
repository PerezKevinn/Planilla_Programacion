"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarClock,
  Plus,
  Trash2,
  Sun,
  Moon,
  Coffee,
  RefreshCw,
} from "lucide-react";

interface Vigilante {
  id: string;
  documento: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  estado: string;
}

interface Puesto {
  id: string;
  codigo: string;
  nombre: string;
  requiereArma: boolean;
}

interface Turno {
  id: string;
  fecha: string;
  tipoTurno: "DIURNO" | "NOCTURNO" | "DESCANSO" | "RELEVO";
  horaInicio: string;
  horaFin: string;
  observaciones: string | null;
  vigilante: Vigilante;
  puesto: Puesto;
  creadoPor?: { nombre: string; rol: string } | null;
}

export default function ProgramacionPage() {
  const hoy = new Date().toISOString().split("T")[0];
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [filtroFecha, setFiltroFecha] = useState(hoy);
  const [filtroPuesto, setFiltroPuesto] = useState("TODOS");
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    vigilanteId: "",
    puestoId: "",
    fecha: hoy,
    tipoTurno: "DIURNO",
    horaInicio: "06:00",
    horaFin: "18:00",
    observaciones: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCatalogos = useCallback(async () => {
    const [resVig, resPue] = await Promise.all([
      fetch("/api/vigilantes?estado=ACTIVO"),
      fetch("/api/puestos"),
    ]);
    const dataVig = await resVig.json();
    const dataPue = await resPue.json();
    if (dataVig.vigilantes) {
      setVigilantes(dataVig.vigilantes);
      if (dataVig.vigilantes.length > 0) {
        setFormData((prev) => ({
          ...prev,
          vigilanteId: prev.vigilanteId || dataVig.vigilantes[0].id,
        }));
      }
    }
    if (dataPue.puestos) {
      setPuestos(dataPue.puestos);
      if (dataPue.puestos.length > 0) {
        setFormData((prev) => ({
          ...prev,
          puestoId: prev.puestoId || dataPue.puestos[0].id,
        }));
      }
    }
  }, []);

  const fetchTurnos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroFecha) params.set("fecha", filtroFecha);
      if (filtroPuesto !== "TODOS") params.set("puestoId", filtroPuesto);

      const res = await fetch(`/api/turnos?${params.toString()}`);
      const data = await res.json();
      if (data.turnos) setTurnos(data.turnos);
    } finally {
      setLoading(false);
    }
  }, [filtroFecha, filtroPuesto]);

  useEffect(() => {
    fetchCatalogos();
  }, [fetchCatalogos]);

  useEffect(() => {
    fetchTurnos();
  }, [fetchTurnos]);

  function handleTipoTurnoChange(tipo: string) {
    let inicio = "06:00";
    let fin = "18:00";
    if (tipo === "NOCTURNO") {
      inicio = "18:00";
      fin = "06:00";
    } else if (tipo === "DESCANSO") {
      inicio = "00:00";
      fin = "23:59";
    }
    setFormData({
      ...formData,
      tipoTurno: tipo,
      horaInicio: inicio,
      horaFin: fin,
    });
  }

  async function handleProgramar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al programar turno");
        setSaving(false);
        return;
      }
      setFormData({ ...formData, observaciones: "" });
      setFiltroFecha(formData.fecha);
      fetchTurnos();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/turnos?id=${id}`, { method: "DELETE" });
    fetchTurnos();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Planilla de Programación de Turnos
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Asigna turnos operativos a los vigilantes activos validando que no
          existan cruces de horario en la misma fecha.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario lateral de asignación */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-fit">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-blue-600" />
            Asignar Nuevo Turno
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleProgramar} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vigilante (Activos) *
              </label>
              <select
                required
                value={formData.vigilanteId}
                onChange={(e) =>
                  setFormData({ ...formData, vigilanteId: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                {vigilantes.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.apellidos} {v.nombres} (CC: {v.documento})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Puesto de Trabajo / Sede *
              </label>
              <select
                required
                value={formData.puestoId}
                onChange={(e) =>
                  setFormData({ ...formData, puestoId: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                {puestos.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.codigo}] {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha del Turno *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Turno *
                </label>
                <select
                  value={formData.tipoTurno}
                  onChange={(e) => handleTipoTurnoChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-semibold"
                >
                  <option value="DIURNO">DIURNO</option>
                  <option value="NOCTURNO">NOCTURNO</option>
                  <option value="RELEVO">RELEVO</option>
                  <option value="DESCANSO">DESCANSO</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hora Inicio
                </label>
                <input
                  type="time"
                  required
                  value={formData.horaInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, horaInicio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hora Fin
                </label>
                <input
                  type="time"
                  required
                  value={formData.horaFin}
                  onChange={(e) =>
                    setFormData({ ...formData, horaFin: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consigna / Observaciones del Turno
              </label>
              <input
                type="text"
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                placeholder="Ej. Portería principal, entrega de llaves..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm shadow-sm transition-colors"
            >
              {saving ? "Programando..." : "Agregar a la Planilla"}
            </button>
          </form>
        </div>

        {/* Tabla de Turnos Programados */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                  Filtrar por Fecha
                </label>
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                  Sede / Puesto
                </label>
                <select
                  value={filtroPuesto}
                  onChange={(e) => setFiltroPuesto(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="TODOS">Todos los puestos</option>
                  {puestos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} - {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setFiltroFecha("")}
              className="text-xs font-semibold text-blue-600 hover:underline mt-4"
            >
              Ver todas las fechas
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-slate-500 text-sm">
                Consultando planilla...
              </div>
            ) : turnos.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarClock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  No hay turnos registrados con los filtros seleccionados
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {turnos.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                          {t.fecha}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            t.tipoTurno === "DIURNO"
                              ? "bg-sky-100 text-sky-800"
                              : t.tipoTurno === "NOCTURNO"
                              ? "bg-indigo-100 text-indigo-800"
                              : t.tipoTurno === "RELEVO"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {t.tipoTurno === "DIURNO" && (
                            <Sun className="w-3 h-3" />
                          )}
                          {t.tipoTurno === "NOCTURNO" && (
                            <Moon className="w-3 h-3" />
                          )}
                          {t.tipoTurno === "DESCANSO" && (
                            <Coffee className="w-3 h-3" />
                          )}
                          {t.tipoTurno === "RELEVO" && (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          {t.tipoTurno} ({t.horaInicio} - {t.horaFin})
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 text-sm">
                        {t.vigilante.apellidos}, {t.vigilante.nombres}{" "}
                        <span className="font-normal text-xs text-slate-500">
                          (CC: {t.vigilante.documento} • {t.vigilante.cargo})
                        </span>
                      </div>

                      <div className="text-xs text-slate-600">
                        Puesto:{" "}
                        <strong className="text-slate-800">
                          [{t.puesto.codigo}] {t.puesto.nombre}
                        </strong>
                        {t.observaciones && ` • Nota: ${t.observaciones}`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(t.id)}
                      className="self-end sm:self-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Eliminar turno de la planilla"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

