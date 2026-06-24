---
name: ronda-docs-sync
description: Use ONLY when updating README.md, AGENTS.md, or other project documentation after changes to routes, flows, architecture, scope, or operational behavior.
---

# Ronda Docs Sync

Esta skill sirve para mantener la documentación alineada con el código real.

## Regla principal

La fuente de verdad es `src/`, no el `README.md` existente.

## Qué revisar antes de documentar

- `src/App.tsx` para rutas y superficies.
- Páginas afectadas en `src/pages/` y `src/pages/admin/`.
- `src/api/` y `src/lib/axios.ts` si cambió integración o auth.

## Qué actualizar cuando corresponda

- `README.md` si cambió la descripción general del producto o sus comandos.
- `AGENTS.md` si cambió alcance, arquitectura, flujos, convenciones o guía de trabajo.

## Estilo

- Documentar solo hechos verificables en el código.
- Mantener textos concretos y orientados al uso real del repositorio.
