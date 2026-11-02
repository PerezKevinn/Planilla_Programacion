import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Inicializando base de datos y datos semilla...");

  const adminPass = await bcrypt.hash("Admin123*", 10);
  const supervisorPass = await bcrypt.hash("Super123*", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@seguridad.com" },
    update: {},
    create: {
      nombre: "Carlos Mendoza (Administrador)",
      email: "admin@seguridad.com",
      passwordHash: adminPass,
      rol: "ADMIN",
      activo: true,
    },
  });

  await prisma.usuario.upsert({
    where: { email: "supervisor@seguridad.com" },
    update: {},
    create: {
      nombre: "Laura Gómez (Supervisora)",
      email: "supervisor@seguridad.com",
      passwordHash: supervisorPass,
      rol: "SUPERVISOR",
      activo: true,
    },
  });

  // Crear puestos de trabajo
  const puesto1 = await prisma.puestoTrabajo.upsert({
    where: { codigo: "PST-001" },
    update: {},
    create: {
      codigo: "PST-001",
      nombre: "Centro Empresarial Torre Norte",
      direccion: "Av. Principal #100-25",
      ciudad: "Bogotá",
      contactoCliente: "Ing. Roberto Silva",
      telefonoCliente: "3104558899",
      requiereArma: true,
      activo: true,
    },
  });

  const puesto2 = await prisma.puestoTrabajo.upsert({
    where: { codigo: "PST-002" },
    update: {},
    create: {
      codigo: "PST-002",
      nombre: "Conjunto Residencial Los Pinos",
      direccion: "Calle 145 #19-40",
      ciudad: "Bogotá",
      contactoCliente: "Adm. Patricia Ruiz",
      telefonoCliente: "3159987744",
      requiereArma: false,
      activo: true,
    },
  });

  const puesto3 = await prisma.puestoTrabajo.upsert({
    where: { codigo: "PST-003" },
    update: {},
    create: {
      codigo: "PST-003",
      nombre: "Planta Logística Industrial Sur",
      direccion: "Zona Industrial Bodega 14",
      ciudad: "Medellín",
      contactoCliente: "Jefe Seg. Hernán Darío",
      telefonoCliente: "3002214455",
      requiereArma: true,
      activo: true,
    },
  });

  // Crear vigilantes iniciales
  const v1 = await prisma.vigilante.upsert({
    where: { documento: "1020456789" },
    update: {},
    create: {
      documento: "1020456789",
      nombres: "Andrés Felipe",
      apellidos: "Ramírez Castro",
      telefono: "3114567890",
      email: "andres.ramirez@correo.com",
      direccion: "Cra 45 #68-12, Barrio Modelo",
      tipoSangre: "O+",
      contactoEmergencia: "María Castro (Madre)",
      telefonoEmergencia: "3129876543",
      cargo: "Vigilante",
      tipoContrato: "Término Indefinido",
      fechaIngreso: new Date("2024-03-15"),
      estado: "ACTIVO",
      observaciones: "Excelente desempeño en control de acceso vehicular y trato al público.",
    },
  });

  const v2 = await prisma.vigilante.upsert({
    where: { documento: "79854123" },
    update: {},
    create: {
      documento: "79854123",
      nombres: "Jorge Eliécer",
      apellidos: "Morales Peña",
      telefono: "3147896541",
      email: "jorge.morales@correo.com",
      direccion: "Calle 80 Sur #14-22",
      tipoSangre: "A+",
      contactoEmergencia: "Sandra Peña (Esposa)",
      telefonoEmergencia: "3145556677",
      cargo: "Escolta",
      tipoContrato: "Término Indefinido",
      fechaIngreso: new Date("2023-07-01"),
      estado: "ACTIVO",
      observaciones: "Especialista en manejo defensivo y escolta ejecutiva con porte vigente.",
    },
  });

  const v3 = await prisma.vigilante.upsert({
    where: { documento: "1032998877" },
    update: {},
    create: {
      documento: "1032998877",
      nombres: "Diana Carolina",
      apellidos: "Vargas Rojas",
      telefono: "3201112233",
      email: "diana.vargas@correo.com",
      direccion: "Av. Suba #115-30 Apto 402",
      tipoSangre: "B+",
      contactoEmergencia: "Pedro Vargas (Hermano)",
      telefonoEmergencia: "3204445566",
      cargo: "Operador de Medios",
      tipoContrato: "Término Fijo",
      fechaIngreso: new Date("2025-01-10"),
      estado: "ACTIVO",
      observaciones: "Encargada de monitoreo CCTV y central de radio.",
    },
  });

  const v4 = await prisma.vigilante.upsert({
    where: { documento: "80112233" },
    update: {},
    create: {
      documento: "80112233",
      nombres: "Héctor Julio",
      apellidos: "Ospina León",
      telefono: "3186549870",
      email: "hector.ospina@correo.com",
      direccion: "Calle 22 #10-15",
      tipoSangre: "O-",
      contactoEmergencia: "Lucía León (Esposa)",
      telefonoEmergencia: "3180001122",
      cargo: "Vigilante",
      tipoContrato: "Relevante",
      fechaIngreso: new Date("2025-06-20"),
      estado: "VACACIONES",
      observaciones: "Relevante disponible para sedes norte y centro.",
    },
  });

  // Limpiar certificaciones y turnos previos del seed para evitar duplicados al re-ejecutar
  await prisma.certificacion.deleteMany({});
  await prisma.turnoProgramacion.deleteMany({});

  const hoy = new Date();
  const en15Dias = new Date(hoy.getTime() + 15 * 24 * 60 * 60 * 1000);
  const en200Dias = new Date(hoy.getTime() + 200 * 24 * 60 * 60 * 1000);
  const hace10Dias = new Date(hoy.getTime() - 10 * 24 * 60 * 60 * 1000);
  const haceUnAnio = new Date(hoy.getTime() - 350 * 24 * 60 * 60 * 1000);

  await prisma.certificacion.createMany({
    data: [
      {
        vigilanteId: v1.id,
        tipo: "Reentrenamiento en Vigilancia",
        entidad: "Academia Nacional de Seguridad",
        numeroCredencial: "NRO-88412",
        fechaExpedicion: haceUnAnio,
        fechaVencimiento: en200Dias,
      },
      {
        vigilanteId: v1.id,
        tipo: "Examen Psicofísico Portar Armas",
        entidad: "Centro Médico Autorizado",
        numeroCredencial: "PSI-30291",
        fechaExpedicion: haceUnAnio,
        fechaVencimiento: en15Dias, // Próximo a vencer
      },
      {
        vigilanteId: v2.id,
        tipo: "Licencia Porte de Armas",
        entidad: "Departamento Control Comercio Armas",
        numeroCredencial: "ARM-99201",
        fechaExpedicion: haceUnAnio,
        fechaVencimiento: en200Dias,
      },
      {
        vigilanteId: v3.id,
        tipo: "Curso Operador Medios Tecnológicos",
        entidad: "Instituto Técnico de Seguridad",
        numeroCredencial: "MED-55102",
        fechaExpedicion: haceUnAnio,
        fechaVencimiento: hace10Dias, // Vencido para mostrar alerta
      },
    ],
  });

  const fechaHoyStr = hoy.toISOString().split("T")[0];

  await prisma.turnoProgramacion.createMany({
    data: [
      {
        vigilanteId: v1.id,
        puestoId: puesto1.id,
        fecha: fechaHoyStr,
        tipoTurno: "DIURNO",
        horaInicio: "06:00",
        horaFin: "18:00",
        observaciones: "Portería principal con armamento",
        creadoPorId: admin.id,
      },
      {
        vigilanteId: v2.id,
        puestoId: puesto3.id,
        fecha: fechaHoyStr,
        tipoTurno: "NOCTURNO",
        horaInicio: "18:00",
        horaFin: "06:00",
        observaciones: "Ronda perimetral y despacho",
        creadoPorId: admin.id,
      },
      {
        vigilanteId: v3.id,
        puestoId: puesto2.id,
        fecha: fechaHoyStr,
        tipoTurno: "DIURNO",
        horaInicio: "06:00",
        horaFin: "18:00",
        observaciones: "Monitoreo CCTV y recepción",
        creadoPorId: admin.id,
      },
    ],
  });

  console.log("Datos semilla cargados correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

