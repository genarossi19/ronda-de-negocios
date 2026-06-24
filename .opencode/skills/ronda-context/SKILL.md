---
name: ronda-context
description: Use when working in this repository and the task touches product behavior, routing, auth, admin pages, registration, shifts, tables, meetings, or project documentation.
---

# Ronda Context

Usá esta skill cuando la tarea impacte el comportamiento del frontend de Ronda de Negocios.

## Checklist corto

1. Revisar `src/App.tsx` para ubicar ruta y superficie afectada.
2. Leer primero la page container correspondiente.
3. Si hay datos remotos, revisar `src/api/`, `src/types/` y `src/lib/axios.ts`.
4. Mantener textos funcionales en español.
5. Preferir cambios mínimos y locales.

## Riesgos frecuentes

- Confundir `AuthContext` obsoleto con el flujo real en `useAuth`.
- Romper guards de empresa o admin al tocar rutas.
- Cambiar copy o UX ignorando dark mode o preferencias de movimiento.
- Modificar comportamiento principal sin sincronizar documentación.

## Validación sugerida

- `npm run typecheck`
- `npm run lint`
- `npm run build` si se tocó integración, rutas principales o componentes ampliamente reutilizados.
