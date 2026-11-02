"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Shield,
  Trash2,
  X,
} from "lucide-react";

interface Puesto {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  contactoCliente: string | null;
  telefonoCliente: string | null;
  requiereArma: boolean;
  activo: boolean;
  _count?: { turnos: number };
}

export default function PuestosPage() {
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    direccion: "",
    ciudad: "Bogotá",
    contactoCliente: "",
    telefonoCliente: "",
    requiereArma: false,
    activo: true,
  });

  async function fetchPuestos() {
    setLoading(true);
    try {
      const res = await fetch("/api/puestos");
      const data = await res.json();
      if (data.puestos) setPuestos(data.puestos);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPuestos();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/puestos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al crear puesto");
      return;
    }
    setModalOpen(false);
    setFormData({
      codigo: "",
      nombre: "",
      direccion: "",
      ciudad: "Bogotá",
      contactoCliente: "",
      telefonoCliente: "",
      requiereArma: false,
      activo: true,
    });
    fetchPuestos();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/puestos?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "No autorizado para eliminar puestos");
      return;
    }
    fetchPuestos();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Puestos de Trabajo y Sedes
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Administra los clientes, edificios y puntos de vigilancia donde son
            asignados los vigilantes.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nuevo Puesto / Sede
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Cargando puestos de trabajo...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {puestos.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                    {p.codigo}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      p.requiereArma
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {p.requiereArma ? "Con Armamento" : "Sin Arma"}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 mt-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  {p.nombre}
                </h3>

                <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {p.direccion} ({p.ciudad})
                    </span>
                  </div>
                  {p.contactoCliente && (
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      <span>Contacto: {p.contactoCliente}</span>
                    </div>
                  )}
                  {p.telefonoCliente && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tel: {p.telefonoCliente}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {p._count?.turnos || 0} turnos históricos
                </span>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg"
                  title="Eliminar puesto (Solo Admin)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-lg font-bold">Registrar Puesto de Trabajo</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código Único *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. PST-004"
                    value={formData.codigo}
                    onChange={(e) =>
                      setFormData({ ...formData, codigo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ciudad}
                    onChange={(e) =>
                      setFormData({ ...formData, ciudad: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la Sede / Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Clínica Santa María"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirección Exacta *
                </label>
                <input
                  type="text"
                  required
                  value={formData.direccion}
                  onChange={(e) =>
                    setFormData({ ...formData, direccion: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contacto del Cliente
                  </label>
                  <input
                    type="text"
                    value={formData.contactoCliente}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactoCliente: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono del Cliente
                  </label>
                  <input
                    type="text"
                    value={formData.telefonoCliente}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telefonoCliente: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.requiereArma}
                  onChange={(e) =>
                    setFormData({ ...formData, requiereArma: e.target.checked })
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span>Este puesto requiere vigilante con porte de arma</span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                >
                  Guardar Puesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

