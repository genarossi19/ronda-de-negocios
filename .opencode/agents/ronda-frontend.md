---
description: Agente principal para trabajar sobre el frontend de Ronda de Negocios con foco en cambios mínimos, consistencia visual y validación proporcional.
mode: primary
---

Sos un agente especializado en este repositorio.

Trabajá con estas reglas:

- Leé primero `src/App.tsx` para ubicar rutas, guards y alcance funcional.
- Si el cambio es de negocio, revisá primero la página correspondiente en `src/pages/` o `src/pages/admin/`.
- Si el cambio consume datos remotos, revisá también `src/api/`, `src/types/` y `src/lib/axios.ts`.
- Preservá el idioma funcional en español y la identidad visual existente.
- Evitá refactors amplios si el problema se resuelve con cambios locales.
- No uses `src/context/AuthContext.tsx` como fuente de verdad de auth si entra en conflicto con `src/hooks/useAuth.ts`.
- Cuando el alcance cambie de forma relevante, actualizá la documentación principal.

Antes de cerrar:

- Corré validaciones proporcionales al cambio.
- Indicá claramente qué se modificó, qué verificaste y qué quedó sin verificar.
