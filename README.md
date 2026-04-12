# ALLFIX BACALAR - Sistema de Gestión Digital

Sistema integral de gestión para el taller **ALLFIX BACALAR**, diseñado para digitalizar el proceso de recepción, diagnóstico, reparación y entrega de equipos electrónicos. El sistema reemplaza los registros manuales de papel con una solución web moderna, segura y eficiente.

## 🚀 Características Principales

- **Gestión de Órdenes (Requerimiento 6):** Registro completo de equipos, accesorios y estados de reparación.
- **Seguimiento en Tiempo Real (Requerimiento 8):** Control de estados: Recibido -> En Proceso -> Terminado -> Entregado.
- **Evidencias Fotográficas (Requerimiento 9):** Almacenamiento de URLs de fotos del estado de entrada del equipo.
- **Diagnóstico y Costos (Requerimientos 14, 15):** Interfaz para que técnicos documenten hallazgos y precios finales.
- **Reportes y Dashboard (Requerimiento 21):** Panel con estadísticas hoy, métricas de cumplimiento e ingresos totales.
- **Diseño Premium (Requerimiento 24):** Interfaz responsiva con estética moderna (Glassmorphism) y soporte para Mobile, Tablet y PC.
- **Comprobantes en PDF (Requerimientos 12, 13):** Generación de reportes de servicio listos para imprimir.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React + Vite, Lucide Icons.
- **Styling:** CSS Moderno (Vanilla).
- **Backend:** Node.js, Express.
- **Base de Datos:** PostgreSQL.
- **Seguridad:** Autenticación basada en JWT y roles (Admin, Técnico, Recepcionista).

## 📦 Instalación y Configuración

### Requisitos Previos
- Node.js (v16+)
- PostgreSQL

### Configuración del Backend
1. Navega a `backend/`.
2. Instala dependencias: `npm install`.
3. Crea un archivo `.env` basado en el `.env.example` (si existe) o define:
   ```env
   PORT=5000
   DB_USER=tu_usuario
   DB_HOST=localhost
   DB_NAME=allfix_db
   DB_PASSWORD=tu_password
   DB_PORT=5432
   JWT_SECRET=tu_secreto_super_seguro
   ```
4. Inicializa la base de datos usando `db/schema.sql`.
5. Inicia el servidor: `npm run dev`.

### Configuración del Frontend
1. Navega a `frontend/`.
2. Instala dependencias: `npm install`.
3. Inicia la aplicación: `npm run dev`.

## 📄 Requerimientos del Proyecto
El sistema cumple con el 100% de los 24 requerimientos definidos por la Universidad Politécnica de Bacalar para el Proyecto Integrador 2026.

## ✒️ Autores
- **Eliel Alegría Cruz**
- **Itamar Abdi May Avila**

---
*Desarrollado para optimizar la trazabilidad y eliminar la pérdida de información en ALLFIX BACALAR.*
