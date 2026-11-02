import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "SegurControl | Base de Datos de Vigilantes y Programación",
  description:
    "Sistema seguro, escalable y centralizado para la gestión de vigilantes, certificaciones, sedes y programación de turnos.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-slate-50">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

