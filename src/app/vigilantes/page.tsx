"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  UserPlus,
  Edit3,
  Trash2,
  Award,
  Phone,
  IdCard,
  ShieldAlert,
  CheckCircle2,
  X,
  Plus,
  FileText,
  HeartPulse,
  Briefcase,
} from "lucide-react";

interface Certificacion {
  id: string;
  tipo: string;
  entidad: string | null;
  numeroCredencial: string | null;
  fechaExpedicion: string;
  fechaVencimiento: string;
}

interface Vigilante {
  id: string;
  documento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string | null;
  direccion: string | null;
  tipoSangre: string | null;
  contactoEmergencia: string | null;
  telefonoEmergencia: string | null;
  cargo: string;
  tipoContrato: string;
  fechaIngreso: string;
  estado: "ACTIVO" | "VACACIONES" | "INCAPACIDAD" | "INACTIVO";
  observaciones: string | null;
  certificaciones: Certificacion[];
  _count?: { turnos: number };
}

const initialForm = {
  documento: "",
  nombres: "",
  apellidos: "",
  telefono: "",
  email: "",
  direccion: "",
  tipoSangre: "O+",
  contactoEmergencia: "",
  telefonoEmergencia: "",
  cargo: "Vigilante",
  tipoContrato: "Término Fijo",
  fechaIngreso: new Date().toISOString().split("T")[0],
  estado: "ACTIVO",
  observaciones: "",
};

export default function VigilantesPage() {
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroCargo, setFiltroCargo] = useState("TODOS");

  // Modal Crear / Editar Vigilante
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal Certificaciones
  const [certModalVigilante, setCertModalVigilante] =
    useState<Vigilante | null>(null);
  const [certForm, setCertForm] = useState({
    tipo: "Reentrenamiento en Vigilancia",
    entidad: "",
    numeroCredencial: "",
    fechaExpedicion: new Date().toISOString().split("T")[0],
    fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });
  const [certSaving, setCertSaving] = useState(false);

  // Modal Eliminar
  const [deleteTarget, setDeleteTarget] = useState<Vigilante | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchVigilantes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: search,
        estado: filtroEstado,
        cargo: filtroCargo,
      });
      const res = await fetch(`/api/vigilantes?${params.toString()}`);
      const data = await res.json();
      if (data.vigilantes) {
        setVigilantes(data.vigilantes);
      }
    } catch (e) {
      console.error("Error cargando vigilantes:", e);
    } finally {
      setLoading(false);
    }
  }, [search, filtroEstado, filtroCargo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVigilantes();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchVigilantes]);

  function openCreateModal() {
    setEditId(null);
    setFormData(initialForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(v: Vigilante) {
    setEditId(v.id);
    setFormData({
      documento: v.documento,
      nombres: v.nombres,
      apellidos: v.apellidos,
      telefono: v.telefono,
      email: v.email || "",
      direccion: v.direccion || "",
      tipoSangre: v.tipoSangre || "O+",
      contactoEmergencia: v.contactoEmergencia || "",
      telefonoEmergencia: v.telefonoEmergencia || "",
      cargo: v.cargo,
      tipoContrato: v.tipoContrato,
      fechaIngreso: new Date(v.fechaIngreso).toISOString().split("T")[0],
      estado: v.estado,
      observaciones: v.observaciones || "",
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSaveVigilante(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      const url = editId ? `/api/vigilantes/${editId}` : "/api/vigilantes";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Error al guardar el vigilante");
        setSaving(false);
        return;
      }

      setModalOpen(false);
      setSaving(false);
      fetchVigilantes();
    } catch {
      setFormError("Error de conexión al guardar");
      setSaving(false);
    }
  }

  async function handleDelete(definitivo: boolean) {
    if (!deleteTarget) return;
    setDeleteError("");
    try {
      const res = await fetch(
        `/api/vigilantes/${deleteTarget.id}?definitivo=${definitivo}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || "No se pudo eliminar el registro");
        return;
      }
      setDeleteTarget(null);
      fetchVigilantes();
    } catch {
      setDeleteError("Error de conexión al eliminar");
    }
  }

  async function handleAddCertificacion(e: React.FormEvent) {
    e.preventDefault();
    if (!certModalVigilante) return;
    setCertSaving(true);
    try {
      const res = await fetch("/api/certificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vigilanteId: certModalVigilante.id,
          ...certForm,
        }),
      });
      if (res.ok) {
        const updatedRes = await fetch(
          `/api/vigilantes?q=${certModalVigilante.documento}`
        );
        const updatedData = await updatedRes.json();
        const found = updatedData.vigilantes?.find(
          (v: Vigilante) => v.id === certModalVigilante.id
        );
        if (found) setCertModalVigilante(found);
        fetchVigilantes();
        setCertForm({
          ...certForm,
          entidad: "",
          numeroCredencial: "",
        });
      }
    } finally {
      setCertSaving(false);
    }
  }

  async function handleDeleteCertificacion(certId: string) {
    if (!certModalVigilante) return;
    await fetch(`/api/certificaciones?id=${certId}`, { method: "DELETE" });
    const updatedCerts = certModalVigilante.certificaciones.filter(
      (c) => c.id !== certId
    );
    setCertModalVigilante({
      ...certModalVigilante,
      certificaciones: updatedCerts,
    });
    fetchVigilantes();
  }

  function getEstadoBadge(estado: Vigilante["estado"]) {
    switch (estado) {
      case "ACTIVO":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "VACACIONES":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "INCAPACIDAD":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-200 text-slate-700 border-slate-300";
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Base de Datos de Vigilantes
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Almacena, consulta, actualiza y administra la información laboral y
            documentación de cada vigilante.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Vigilante
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cédula/documento, nombres, apellidos o teléfono..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
          />
        </div>

        <div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-600 outline-none"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVO">Estado: ACTIVO</option>
            <option value="VACACIONES">Estado: VACACIONES</option>
            <option value="INCAPACIDAD">Estado: INCAPACIDAD</option>
            <option value="INACTIVO">Estado: INACTIVO</option>
          </select>
        </div>

        <div>
          <select
            value={filtroCargo}
            onChange={(e) => setFiltroCargo(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-600 outline-none"
          >
            <option value="TODOS">Todos los cargos</option>
            <option value="Vigilante">Cargo: Vigilante</option>
            <option value="Escolta">Cargo: Escolta</option>
            <option value="Supervisor">Cargo: Supervisor</option>
            <option value="Operador de Medios">Cargo: Operador de Medios</option>
          </select>
        </div>
      </div>

      {/* Tabla / Listado de Vigilantes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Cargando base de datos de vigilantes...
          </div>
        ) : vigilantes.length === 0 ? (
          <div className="p-12 text-center">
            <IdCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              No se encontraron vigilantes
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Intenta cambiar los filtros de búsqueda o registra un nuevo
              vigilante.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Vigilante / Documento</th>
                  <th className="py-3.5 px-4">Contacto & Emergencia</th>
                  <th className="py-3.5 px-4">Cargo & Contrato</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Cursos / Licencias</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {vigilantes.map((v) => {
                  const ahora = Date.now();
                  const vencidos = v.certificaciones.filter(
                    (c) => new Date(c.fechaVencimiento).getTime() < ahora
                  ).length;
                  const porVencer = v.certificaciones.filter((c) => {
                    const diff =
                      (new Date(c.fechaVencimiento).getTime() - ahora) /
                      (1000 * 60 * 60 * 24);
                    return diff >= 0 && diff <= 30;
                  }).length;

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">
                          {v.apellidos}, {v.nombres}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                            CC: {v.documento}
                          </span>
                          {v.tipoSangre && (
                            <span className="text-red-600 font-semibold">
                              RH: {v.tipoSangre}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {v.telefono}
                        </div>
                        {v.direccion && (
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">
                            {v.direccion}
                          </div>
                        )}
                        {v.contactoEmergencia && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Emergencia: {v.contactoEmergencia} (
                            {v.telefonoEmergencia})
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">
                          {v.cargo}
                        </div>
                        <div className="text-xs text-slate-500">
                          {v.tipoContrato}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Ingreso:{" "}
                          {new Date(v.fechaIngreso).toISOString().split("T")[0]}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${getEstadoBadge(
                            v.estado
                          )}`}
                        >
                          {v.estado}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <button
                          onClick={() => setCertModalVigilante(v)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                          <Award className="w-4 h-4 text-blue-600" />
                          <span>{v.certificaciones.length} registrados</span>
                          {vencidos > 0 && (
                            <span className="bg-red-600 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                              {vencidos} venc.
                            </span>
                          )}
                          {vencidos === 0 && porVencer > 0 && (
                            <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                              {porVencer} alerta
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(v)}
                            title="Editar información"
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteError("");
                              setDeleteTarget(v);
                            }}
                            title="Dar de baja o eliminar"
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR VIGILANTE */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editId
                  ? "Editar Expediente del Vigilante"
                  : "Registrar Nuevo Vigilante"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveVigilante}
              className="p-6 max-h-[80vh] overflow-y-auto space-y-5"
            >
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              {/* Sección 1: Datos Personales */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 mb-3">
                  <FileText className="w-4 h-4" /> 1. Datos de Identificación y
                  Contacto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cédula / Documento *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.documento}
                      onChange={(e) =>
                        setFormData({ ...formData, documento: e.target.value })
                      }
                      placeholder="Ej. 1020304050"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombres *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombres}
                      onChange={(e) =>
                        setFormData({ ...formData, nombres: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.apellidos}
                      onChange={(e) =>
                        setFormData({ ...formData, apellidos: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Teléfono Celular *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Grupo Sanguíneo (RH)
                    </label>
                    <select
                      value={formData.tipoSangre}
                      onChange={(e) =>
                        setFormData({ ...formData, tipoSangre: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(
                        (rh) => (
                          <option key={rh} value={rh}>
                            {rh}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dirección de Residencia
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) =>
                      setFormData({ ...formData, direccion: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Sección 2: Información Laboral */}
              <div className="pt-3 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 mb-3">
                  <Briefcase className="w-4 h-4" /> 2. Datos Laborales y Estado
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cargo Operativo
                    </label>
                    <select
                      value={formData.cargo}
                      onChange={(e) =>
                        setFormData({ ...formData, cargo: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="Vigilante">Vigilante</option>
                      <option value="Escolta">Escolta</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Operador de Medios">
                        Operador de Medios
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipo de Contrato
                    </label>
                    <select
                      value={formData.tipoContrato}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipoContrato: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="Término Fijo">Término Fijo</option>
                      <option value="Término Indefinido">
                        Término Indefinido
                      </option>
                      <option value="Relevante">Relevante</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fecha de Ingreso
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fechaIngreso}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fechaIngreso: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estado Actual
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) =>
                        setFormData({ ...formData, estado: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-semibold"
                    >
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="VACACIONES">VACACIONES</option>
                      <option value="INCAPACIDAD">INCAPACIDAD</option>
                      <option value="INACTIVO">INACTIVO</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección 3: Contacto de Emergencia y Observaciones */}
              <div className="pt-3 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 mb-3">
                  <HeartPulse className="w-4 h-4" /> 3. Contacto de Emergencia y
                  Observaciones
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre Contacto de Emergencia (Parentesco)
                    </label>
                    <input
                      type="text"
                      value={formData.contactoEmergencia}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactoEmergencia: e.target.value,
                        })
                      }
                      placeholder="Ej. María Pérez (Esposa)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Teléfono de Emergencia
                    </label>
                    <input
                      type="text"
                      value={formData.telefonoEmergencia}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          telefonoEmergencia: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Observaciones / Notas del Expediente
                  </label>
                  <textarea
                    rows={2}
                    value={formData.observaciones}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        observaciones: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm"
                >
                  {saving
                    ? "Guardando..."
                    : editId
                    ? "Guardar Cambios"
                    : "Registrar Vigilante"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CERTIFICACIONES Y CURSOS */}
      {certModalVigilante && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Certificaciones, Cursos y Licencias
                </h2>
                <p className="text-xs text-slate-300">
                  Vigilante: {certModalVigilante.nombres}{" "}
                  {certModalVigilante.apellidos} (CC:{" "}
                  {certModalVigilante.documento})
                </p>
              </div>
              <button
                onClick={() => setCertModalVigilante(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
              {/* Lista de certificaciones actuales */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Documentación Registrada (
                  {certModalVigilante.certificaciones.length})
                </h3>
                {certModalVigilante.certificaciones.length === 0 ? (
                  <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                    Este vigilante aún no tiene cursos ni licencias registradas.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {certModalVigilante.certificaciones.map((c) => {
                      const diffDias = Math.ceil(
                        (new Date(c.fechaVencimiento).getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24)
                      );
                      const vencido = diffDias < 0;
                      const porVencer = diffDias >= 0 && diffDias <= 30;

                      return (
                        <div
                          key={c.id}
                          className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                              {c.tipo}
                              {vencido ? (
                                <span className="bg-red-100 text-red-700 text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <ShieldAlert className="w-3 h-3" /> Vencido
                                </span>
                              ) : porVencer ? (
                                <span className="bg-amber-100 text-amber-800 text-[11px] px-2 py-0.5 rounded-full font-bold">
                                  Vence en {diffDias} días
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Vigente
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {c.entidad || "Entidad no especificada"}{" "}
                              {c.numeroCredencial &&
                                `• Credencial: ${c.numeroCredencial}`}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              Expedición:{" "}
                              {
                                new Date(c.fechaExpedicion)
                                  .toISOString()
                                  .split("T")[0]
                              }{" "}
                              | Vencimiento:{" "}
                              <strong className="text-slate-700">
                                {
                                  new Date(c.fechaVencimiento)
                                    .toISOString()
                                    .split("T")[0]
                                }
                              </strong>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteCertificacion(c.id)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                            title="Eliminar certificación"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Formulario agregar nueva certificación */}
              <form
                onSubmit={handleAddCertificacion}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Agregar Curso / Certificación /
                  Licencia
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Tipo de Curso o Licencia
                    </label>
                    <select
                      value={certForm.tipo}
                      onChange={(e) =>
                        setCertForm({ ...certForm, tipo: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="Fundamentación Vigilancia">
                        Fundamentación Vigilancia
                      </option>
                      <option value="Reentrenamiento en Vigilancia">
                        Reentrenamiento en Vigilancia
                      </option>
                      <option value="Examen Psicofísico Portar Armas">
                        Examen Psicofísico Portar Armas
                      </option>
                      <option value="Licencia Porte de Armas">
                        Licencia Porte de Armas
                      </option>
                      <option value="Curso Operador Medios Tecnológicos">
                        Curso Operador Medios Tecnológicos
                      </option>
                      <option value="Especialización Escolta">
                        Especialización Escolta
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Academia / Entidad Certificadora
                    </label>
                    <input
                      type="text"
                      value={certForm.entidad}
                      onChange={(e) =>
                        setCertForm({ ...certForm, entidad: e.target.value })
                      }
                      placeholder="Ej. Academia Nacional"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      N° Credencial / Diploma
                    </label>
                    <input
                      type="text"
                      value={certForm.numeroCredencial}
                      onChange={(e) =>
                        setCertForm({
                          ...certForm,
                          numeroCredencial: e.target.value,
                        })
                      }
                      placeholder="Ej. NRO-12345"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Fecha Expedición
                    </label>
                    <input
                      type="date"
                      required
                      value={certForm.fechaExpedicion}
                      onChange={(e) =>
                        setCertForm({
                          ...certForm,
                          fechaExpedicion: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Fecha Vencimiento
                    </label>
                    <input
                      type="date"
                      required
                      value={certForm.fechaVencimiento}
                      onChange={(e) =>
                        setCertForm({
                          ...certForm,
                          fechaVencimiento: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={certSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold"
                  >
                    {certSaving ? "Agregando..." : "+ Guardar Certificación"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN / BAJA SEGURA */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900">
              ¿Eliminar o dar de baja al vigilante?
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Seleccionaste a{" "}
              <strong>
                {deleteTarget.nombres} {deleteTarget.apellidos}
              </strong>{" "}
              (CC: {deleteTarget.documento}).
            </p>

            {deleteError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {deleteError}
              </div>
            )}

            <div className="mt-5 space-y-2.5">
              <button
                onClick={() => handleDelete(false)}
                className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold text-center"
              >
                Archivar / Dar de Baja Segura (Recomendado)
              </button>
              <button
                onClick={() => handleDelete(true)}
                className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold text-center"
              >
                Eliminar Permanentemente de la Base de Datos
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="w-full py-2 px-4 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

