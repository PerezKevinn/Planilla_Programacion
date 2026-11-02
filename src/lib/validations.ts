import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido").trim().toLowerCase(),
  password: z.string().min(4, "La contraseña es requerida"),
});

export const vigilanteSchema = z.object({
  documento: z
    .string()
    .trim()
    .min(5, "El documento debe tener al menos 5 caracteres")
    .max(20, "El documento no puede exceder 20 caracteres")
    .regex(/^[0-9A-Za-z-]+$/, "El documento solo puede contener números, letras o guiones"),
  nombres: z
    .string()
    .trim()
    .min(2, "Los nombres son obligatorios")
    .max(80, "Máximo 80 caracteres"),
  apellidos: z
    .string()
    .trim()
    .min(2, "Los apellidos son obligatorios")
    .max(80, "Máximo 80 caracteres"),
  telefono: z
    .string()
    .trim()
    .min(7, "El teléfono debe tener al menos 7 dígitos")
    .max(20, "Máximo 20 caracteres"),
  email: z
    .string()
    .trim()
    .email("Correo electrónico inválido")
    .optional()
    .or(z.literal("")),
  direccion: z.string().trim().max(150).optional().or(z.literal("")),
  tipoSangre: z
    .enum(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"])
    .default("O+"),
  contactoEmergencia: z.string().trim().max(100).optional().or(z.literal("")),
  telefonoEmergencia: z.string().trim().max(20).optional().or(z.literal("")),
  cargo: z
    .enum(["Vigilante", "Escolta", "Supervisor", "Operador de Medios"])
    .default("Vigilante"),
  tipoContrato: z
    .enum(["Término Fijo", "Término Indefinido", "Relevante"])
    .default("Término Fijo"),
  fechaIngreso: z.string().min(1, "La fecha de ingreso es obligatoria"),
  estado: z
    .enum(["ACTIVO", "VACACIONES", "INCAPACIDAD", "INACTIVO"])
    .default("ACTIVO"),
  observaciones: z.string().trim().max(500).optional().or(z.literal("")),
});

export const certificacionSchema = z.object({
  vigilanteId: z.string().min(1, "El vigilante es obligatorio"),
  tipo: z.string().trim().min(3, "El tipo de certificación es obligatorio").max(100),
  entidad: z.string().trim().max(100).optional().or(z.literal("")),
  numeroCredencial: z.string().trim().max(50).optional().or(z.literal("")),
  fechaExpedicion: z.string().min(1, "La fecha de expedición es obligatoria"),
  fechaVencimiento: z.string().min(1, "La fecha de vencimiento es obligatoria"),
});

export const puestoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "El código debe tener al menos 3 caracteres")
    .max(20),
  nombre: z.string().trim().min(3, "El nombre del puesto es obligatorio").max(120),
  direccion: z.string().trim().min(5, "La dirección es obligatoria").max(150),
  ciudad: z.string().trim().min(2, "La ciudad es obligatoria").max(60),
  contactoCliente: z.string().trim().max(100).optional().or(z.literal("")),
  telefonoCliente: z.string().trim().max(25).optional().or(z.literal("")),
  requiereArma: z.boolean().default(false),
  activo: z.boolean().default(true),
});

export const turnoSchema = z.object({
  vigilanteId: z.string().min(1, "Debes seleccionar un vigilante"),
  puestoId: z.string().min(1, "Debes seleccionar un puesto de trabajo"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  tipoTurno: z.enum(["DIURNO", "NOCTURNO", "DESCANSO", "RELEVO"]),
  horaInicio: z.string().min(1, "Hora de inicio requerida"),
  horaFin: z.string().min(1, "Hora de fin requerida"),
  observaciones: z.string().trim().max(250).optional().or(z.literal("")),
});

