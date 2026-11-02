"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Building2,
  CalendarClock,
  LogOut,
  Lock,
} from "lucide-react";

interface NavbarProps {
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: "ADMIN" | "SUPERVISOR";
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (!user || pathname === "/login") {
    return null;
  }

  const navItems = [
    { href: "/", label: "Panel General", icon: LayoutDashboard },
    { href: "/vigilantes", label: "Base de Vigilantes", icon: Users },
    { href: "/puestos", label: "Puestos / Sedes", icon: Building2 },
    { href: "/programacion", label: "Planilla de Turnos", icon: CalendarClock },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-blue-600 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight block leading-none">
                  SEGURCONTROL
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Gestión de Vigilantes y Programación
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${active
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{user.nombre}</div>
              <div className="flex items-center justify-end gap-1 text-xs text-slate-400">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>
                  Rol:{" "}
                  <strong
                    className={
                      user.rol === "ADMIN" ? "text-amber-400" : "text-sky-400"
                    }
                  >
                    {user.rol}
                  </strong>
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar sesión segura"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Navegación móvil */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

