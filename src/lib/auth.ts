import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  nombre: string;
  email: string;
  rol: "ADMIN" | "SUPERVISOR";
}

const COOKIE_NAME = "planilla_session";

function getSecretKey(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    "clave-secreta-segura-planilla-vigilantes-2026-produccion-cambiar";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.id || !payload.email || !payload.rol) {
      return null;
    }
    return {
      id: String(payload.id),
      nombre: String(payload.nombre),
      email: String(payload.email),
      rol: payload.rol === "ADMIN" ? "ADMIN" : "SUPERVISOR",
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export { COOKIE_NAME };

