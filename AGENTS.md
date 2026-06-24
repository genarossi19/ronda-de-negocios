# AGENTS.md

## Propósito

Este proyecto es el frontend del sistema **Ronda de Negocios** para la Subsecretaría de Desarrollo Económico y Productivo del Municipio de Trenque Lauquen.

Su objetivo actual es permitir:

- Difundir la ronda vigente desde una landing pública.
- Registrar empresas participantes.
- Autenticar empresas y administradores.
- Gestionar representantes por empresa.
- Confirmar participación en el evento activo.
- Consultar turnos y reservar mesas de reunión.
- Consultar historial de reuniones por empresa.
- Administrar rondas, empresas, turnos, mesas, asistencia y catálogos auxiliares desde un panel admin.

## Estado Actual Del Proyecto

El proyecto ya no es un template base de Vite, aunque `README.md` todavía conserva el contenido por defecto y está desactualizado.

La implementación real existente incluye:

- Rutas públicas, privadas y privadas solo para admin en `src/App.tsx`.
- Login con JWT persistido en cookie `token`.
- Sincronización de sesión con Zustand en `src/store/userStore.ts`.
- Manejo centralizado de expiración de sesión en `src/lib/axios.ts`.
- Registro multi-paso de empresas con carga de logo y aceptación de términos.
- Flujos de verificación de email y recuperación de contraseña.
- Gestión operativa de turnos, mesas, asientos, representantes y reuniones.
- Panel administrativo bastante avanzado para la operación del evento.
- Soporte de tema claro/oscuro y reducción de animaciones.

## Stack Técnico

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

## Comandos Útiles

- `npm run dev`: entorno local con Vite.
- `npm run build`: limpia, compila TypeScript y genera build.
- `npm run typecheck`: chequeo de tipos.
- `npm run lint`: lint del proyecto.
- `npm run preview`: preview local del build.

No hay una suite de tests automatizados visible en el repositorio al momento de crear este archivo.

## Arquitectura Del Frontend

- `src/App.tsx`: define providers globales y todas las rutas.
- `src/pages/`: páginas principales de usuario final.
- `src/pages/admin/`: páginas del panel administrativo.
- `src/components/`: componentes compartidos de dominio y layout.
- `src/components/ui/`: primitives de UI estilo shadcn/Radix adaptadas al proyecto.
- `src/api/`: capa de acceso HTTP por dominio.
- `src/types/`: contratos TypeScript de entidades backend.
- `src/lib/axios.ts`: cliente Axios, interceptores y helpers de errores/sesión.
- `src/hooks/`: hooks de auth, sesión, usuario actual y preferencias de movimiento.
- `src/context/`: tema y preferencias globales.
- `src/store/`: estado global de usuario autenticado.

## Modelo De Uso Actual

Existen dos perfiles principales de uso:

- **Empresa participante**
- **Administrador / superusuario**

### Flujo Empresa

- Navega la landing pública.
- Puede registrarse en `/register`.
- Verifica email y luego inicia sesión en `/login`.
- Gestiona sus representantes en `/representantes`.
- Confirma participación en el evento activo.
- Consulta turnos en `/turnos`.
- Reserva o modifica asientos/mesas en `/mesas/:id`.
- Consulta su historial de reuniones en `/reuniones`.

### Flujo Admin

- Ingresa con credenciales admin.
- Accede a `/panel-administrador`.
- Gestiona eventos/rondas en `/panel-administrador/gestionar-rondas`.
- Gestiona empresas en `/panel-administrador/empresas`.
- Gestiona turnos por evento en `/panel-administrador/turnos/:eventoId`.
- Opera la sala en vivo en `/panel-administrador/sala-en-vivo/:eventoId`.
- Revisa resumen de reuniones y asistencia en `/panel-administrador/reuniones`.
- Administra catálogos auxiliares en `/panel-administrador/otros`.

## Mapa Funcional Implementado

### Público

- `Landing.tsx`: hero principal, información del evento activo, CTA, confirmación de participación para usuarios autenticados, acceso a empresas.
- `Empresas.tsx` y `EmpresasDetail.tsx`: catálogo de empresas participantes.
- `RegisterStep.tsx`: registro multi-paso de empresa con carga de logo, sectores, provincias, localidades, términos y privacidad.
- `RegisterSuccess.tsx`: confirmación posterior al registro.
- `ValidarEmail.tsx` y `VerificarEmailRepresentante.tsx`: validación de correos.
- `ForgotPassword.tsx` y `ResetPassword.tsx`: recuperación de contraseña.

### Empresa Autenticada

- `Shifts.tsx`: listado de turnos del evento activo, con estados y validaciones según aprobación/participación.
- `Tables.tsx`: gestión de mesas y asientos por turno.
- `Representantes.tsx`: alta, edición, baja y filtrado de representantes.
- `Reuniones.tsx`: historial de reuniones de la empresa.

### Administración

- `Dashboard.tsx`: resumen operativo del evento activo, empresas, mesas y turnos.
- `GestionarRondas.tsx`: alta/edición de eventos y notificaciones.
- `CompaniesManagement.tsx`: aprobación, visualización y baja lógica/operativa de empresas.
- `GestionarTurnos.tsx`: administración de turnos y mesas por evento.
- `MeetingsSummary.tsx`: resumen consolidado de mesas, participantes y asistencia.
- `SalaEnVivo.tsx`: operación del evento en tiempo real con temporizador por turno.
- `GestionarOtros.tsx`: CRUD de cargos, sectores, provincias y localidades.

## Integración Con Backend

La aplicación depende de una API externa ya existente. El frontend actual asume que el backend expone, al menos, estos dominios:

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

Consideraciones importantes:

- El `baseURL` principal está hardcodeado en `src/lib/axios.ts` hacia `https://rondadenegocios-api.trenquelauquen.gov.ar`.
- Existe proxy de Vite en `vite.config.ts`, pero la app hoy usa base URL absoluta en Axios.
- La expiración de sesión se detecta en interceptores y redirige a login.
- Hay una instancia `api` autenticada y una `publicApi` para endpoints públicos.

## Convenciones Reales Del Código

- El idioma funcional y del copy es **español**.
- Los nombres de componentes y tipos mezclan español e inglés; no intentar normalizar todo salvo que la tarea lo requiera.
- La lógica de negocio está bastante concentrada en las páginas; antes de extraer helpers, priorizar cambios puntuales.
- La UI usa una identidad visual verde institucional con soporte dark mode.
- Muchas pantallas incluyen skeletons, toasts, diálogos y tours guiados; conservar esos patrones cuando se extienda una vista existente.
- Las preferencias de tema y animaciones son parte del producto, no un detalle cosmético.

## Puntos De Atención Para Agentes

- `src/context/AuthContext.tsx` está marcado como **obsoleto**; la autenticación real vive en `src/hooks/useAuth.ts`.
- `src/pages/Settings.tsx` existe, pero la configuración visible al usuario parece estar centralizada en `src/components/SettingsModal.tsx` disparado desde `Navbar`.
- Hay varios archivos `.DS_Store` dentro de `src/` y `public/`; no forman parte del dominio.
- `README.md` y `AGENTS.md` deben mantenerse sincronizados con el comportamiento real del producto.
- El proyecto no muestra tests automáticos; verificar con `lint`, `typecheck` y `build` cuando una tarea toque lógica relevante.
- Si cambia el alcance, los flujos, la arquitectura o la documentación principal del proyecto, actualizar también este `AGENTS.md` para mantenerlo sincronizado con el estado real del repositorio.

## Alcance Actual

El alcance observable hoy es exclusivamente **frontend web** de operación y gestión de rondas de negocios.

Incluye:

- Experiencia pública de difusión e inscripción.
- Experiencia privada para empresas.
- Experiencia administrativa para operación del evento.

No incluye en este repositorio:

- Backend.
- Base de datos.
- Infraestructura de despliegue.
- Aplicaciones móviles.
- Suite formal de tests end-to-end o unitarios visible en código.

## Guía De Trabajo Recomendada Para OpenCode

- Leer primero `src/App.tsx` para entender rutas y alcance de la tarea.
- Si el cambio es de negocio, revisar primero el page container correspondiente en `src/pages/` o `src/pages/admin/`.
- Si el cambio involucra datos remotos, revisar el service del dominio en `src/api/` y los tipos en `src/types/`.
- Si el cambio afecta autenticación o redirecciones, revisar `src/hooks/useAuth.ts`, `src/components/ProtectedRoute.tsx` y `src/lib/axios.ts`.
- Mantener consistencia visual con `Navbar`, `Footer`, `components/ui` y los colores ya establecidos.
- Preservar los textos en español salvo pedido explícito contrario.
- Evitar refactors amplios si la tarea puede resolverse con cambios locales.

## Resumen Rápido

Si necesitás orientarte rápido: este proyecto ya implementa el frontend operativo de una ronda de negocios con roles empresa/admin, autenticación JWT, gestión de empresas/representantes/turnos/mesas/reuniones y un panel admin robusto. La fuente de verdad para el comportamiento actual es el código en `src/`, no el `README.md`.
