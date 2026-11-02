# SegurControl - Base de Datos de Vigilantes y Planilla de Programación

Sistema web Full-Stack diseñado bajo estándares modernos de **seguridad**, **escalabilidad** y **facilidad de mantenimiento** para almacenar, consultar, crear, actualizar y dar de baja la información de los vigilantes de una empresa de seguridad privada, así como sus cursos/licencias, puestos de trabajo y programación de turnos.

---

## Arquitectura y Seguridad Implementada

1. **Encriptación y Sesiones Seguras:**
   - Contraseñas cifradas con `bcryptjs` (factor de costo 10).
   - Sesiones firmadas con `JWT` (`jose` HS256) almacenadas en cookies `HttpOnly` y `SameSite=Lax` (protección contra ataques XSS y CSRF).
   - Middleware global (`src/middleware.ts`) que intercepta y protege todas las vistas y rutas de API.
2. **Control de Acceso Basado en Roles (RBAC):**
   - **ADMIN:** Control total sobre vigilantes, puestos, turnos y eliminación/baja de registros.
   - **SUPERVISOR:** Puede consultar, registrar y actualizar vigilantes, certificaciones y turnos, pero tiene bloqueada la eliminación de vigilantes y sedes.
3. **Validación Estricta de Datos (`Zod`) y Prevención de Inyección SQL (`Prisma ORM`):**
   - Todos los datos recibidos en la API pasan por esquemas `Zod` (`src/lib/validations.ts`) antes de tocar la base de datos.
   - Consultas parametrizadas mediante Prisma ORM.
4. **Integridad Histórica (Borrado Lógico / Soft Delete):**
   - Al dar de baja a un vigilante se ofrece la opción recomendada de **Archivado Seguro (`eliminado = true`)** para no perder el historial de turnos pasados, o eliminación física definitiva para Administradores.

---

## Cuentas Iniciales de Prueba

| Rol | Correo | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@seguridad.com` | `Admin123*` | Acceso total (Crear, Consultar, Editar, Eliminar) |
| **Supervisor** | `supervisor@seguridad.com` | `Super123*` | Operación y consulta (Sin permisos de borrado) |

---

## Comandos Principales

```bash
# 1. Instalar dependencias
npm install

# 2. Inicializar base de datos y datos de ejemplo
npm run db:setup

# 3. Iniciar servidor de desarrollo (http://localhost:3000)
npm run dev
```

