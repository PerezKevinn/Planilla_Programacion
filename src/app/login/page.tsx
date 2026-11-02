"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@seguridad.com");
  const [password, setPassword] = useState("Admin123*");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Error de conexión con el servidor");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-slate-900 p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/30 mb-4">
            <ShieldCheck className="w-9 h-9 text-blue-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SEGURCONTROL</h1>
          <p className="text-sm text-blue-200 mt-1">
            Sistema Centralizado de Vigilantes y Programación
          </p>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-6">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              Acceso protegido con encriptación bcrypt y sesión JWT HttpOnly
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo Electrónico Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  placeholder="usuario@seguridad.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm"
            >
              {loading ? "Verificando credenciales..." : "Ingresar al Sistema"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              Cuentas preconfiguradas de prueba:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@seguridad.com");
                  setPassword("Admin123*");
                }}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
              >
                <div className="text-xs font-bold text-slate-800">
                  Rol: ADMIN
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  admin@seguridad.com
                </div>
                <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                  Control total + Eliminar
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("supervisor@seguridad.com");
                  setPassword("Super123*");
                }}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
              >
                <div className="text-xs font-bold text-slate-800">
                  Rol: SUPERVISOR
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  supervisor@seguridad.com
                </div>
                <div className="text-[10px] text-sky-600 font-medium mt-0.5">
                  Consulta y Programación
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

