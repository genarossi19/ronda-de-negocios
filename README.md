# Ronda de Negocios

Frontend web del sistema de **Ronda de Negocios** para la Subsecretaría de Desarrollo Económico y Productivo del Municipio de Trenque Lauquen.

La aplicación permite difundir la ronda vigente, registrar empresas, autenticar usuarios, gestionar representantes, reservar reuniones por turnos y operar el evento desde un panel administrativo.

## Estado Actual

Este repositorio ya no es un template base de Vite. La implementación actual incluye:

- Landing pública con información del evento activo.
- Registro multi-paso de empresas con logo, sector, provincia, localidad y aceptación de términos.
- Login con JWT persistido en cookie `token`.
- Verificación de email y recuperación de contraseña.
- Gestión de representantes por empresa.
- Confirmación de participación en el evento activo.
- Consulta de turnos y reserva de mesas.
- Historial de reuniones por empresa.
- Panel admin para operar empresas, rondas, turnos, reuniones, asistencia y catálogos auxiliares.

## Perfiles De Uso

### Empresa

- Navega la landing pública.
- Se registra en `/register`.
- Verifica email e inicia sesión en `/login`.
- Gestiona representantes en `/representantes`.
- Confirma participación en el evento activo.
- Consulta turnos en `/turnos`.
- Reserva mesas en `/mesas/:id`.
- Consulta historial en `/reuniones`.

### Administrador

- Inicia sesión con credenciales admin.
- Accede a `/panel-administrador`.
- Gestiona eventos en `/panel-administrador/gestionar-rondas`.
- Gestiona empresas en `/panel-administrador/empresas`.
- Gestiona turnos por evento en `/panel-administrador/turnos/:eventoId`.
- Opera sala en vivo en `/panel-administrador/sala-en-vivo/:eventoId`.
- Consulta reuniones y asistencia en `/panel-administrador/reuniones`.
- Administra cargos, sectores, provincias y localidades en `/panel-administrador/otros`.

## Stack

- React 19
- TypeScript
- Vite
- React Router 7
- Tailwind CSS 4
- Radix UI
- Zustand
- Axios
- Motion
- Sonner

## Scripts

- `npm run dev`: entorno local con Vite.
- `npm run build`: limpia `dist`, compila TypeScript y genera build.
- `npm run build:local`: variante local del build.
- `npm run typecheck`: chequeo de tipos.
- `npm run lint`: lint del proyecto.
- `npm run lint:fix`: corrige problemas simples de lint.
- `npm run preview`: preview local del build.

## Arquitectura

- `src/App.tsx`: providers globales y definición de rutas.
- `src/pages/`: pantallas de usuario final.
- `src/pages/admin/`: pantallas del panel administrativo.
- `src/components/`: componentes compartidos de layout y dominio.
- `src/components/ui/`: primitives de UI reutilizables.
- `src/api/`: servicios HTTP por dominio.
- `src/types/`: contratos TypeScript del backend.
- `src/lib/axios.ts`: cliente Axios, interceptores, manejo de errores y expiración de sesión.
- `src/hooks/`: autenticación, usuario actual, expiración de sesión y preferencias de movimiento.
- `src/context/`: tema y preferencias globales.
- `src/store/`: estado global con Zustand.

## Rutas Principales

### Públicas

- `/`
- `/empresas`
- `/empresas/:id`
- `/login`
- `/register`
- `/register-success`
- `/verificar-email/:uidb64/:token`
- `/verificar-email-representante/:uidb64/:token`
- `/olvide-contraseña`
- `/reset-password/:uidb/:token`

### Privadas Empresa

- `/turnos`
- `/mesas/:id`
- `/representantes`
- `/reuniones`

### Privadas Admin

- `/panel-administrador`
- `/panel-administrador/gestionar-rondas`
- `/panel-administrador/empresas`
- `/panel-administrador/turnos/:eventoId`
- `/panel-administrador/sala-en-vivo/:eventoId`
- `/panel-administrador/reuniones`
- `/panel-administrador/otros`

## Integración Con Backend

La aplicación consume una API externa. Actualmente el frontend trabaja con dominios como:

- `/acceso/*`
- `/empresas/*`
- `/eventos/*`
- `/turnos/*`
- `/mesas/*`
- `/asientos/*`
- `/representantes/*`
- `/cargos/*`
- `/sectores/*`
- `/provincias/*`
- `/localidades/*`

Notas importantes:

- `src/lib/axios.ts` usa `https://rondadenegocios-api.trenquelauquen.gov.ar` como `baseURL` principal.
- Existe proxy en `vite.config.ts`, pero hoy la app usa base URL absoluta en Axios.
- La expiración de sesión se centraliza en interceptores y redirige a login.
- Se usan dos clientes: `api` autenticado y `publicApi` para endpoints públicos.

## Convenciones Reales Del Proyecto

- El idioma de la interfaz y del negocio es **español**.
- Hay mezcla de nombres en español e inglés en componentes y tipos.
- Gran parte de la lógica de negocio vive en las páginas, no en capas muy abstraídas.
- La UI mantiene una identidad verde institucional con soporte dark mode.
- Existen skeletons, diálogos, toasts y tours guiados en varias pantallas; conviene respetar esos patrones.
- `src/context/AuthContext.tsx` está obsoleto; la autenticación real vive en `src/hooks/useAuth.ts`.

## Estado De Calidad

- No se observa una suite automatizada de tests unitarios o e2e en este repositorio.
- Para validar cambios conviene usar `npm run typecheck`, `npm run lint` y `npm run build` según el impacto.

## Alcance Del Repositorio

Incluye:

- Frontend público de difusión e inscripción.
- Frontend privado para empresas participantes.
- Frontend administrativo para operación del evento.

No incluye:

- Backend.
- Base de datos.
- Infraestructura.
- Aplicaciones móviles.

## Documentación Relacionada

- `AGENTS.md`: contexto operativo para agentes y asistentes que trabajen sobre este repositorio.
- `TERMINOS_Y_CONDICIONES.md`: contenido legal usado por el flujo de registro.
- `POLITICA_DE_PRIVACIDAD.md`: contenido legal usado por el flujo de registro.

Cuando cambie el comportamiento real del sistema, actualizar también `AGENTS.md` para mantener sincronizada la documentación operativa del proyecto.
