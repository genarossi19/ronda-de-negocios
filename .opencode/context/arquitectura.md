# Arquitectura del frontend

## Alcance real

Este repositorio implementa el frontend web de una ronda de negocios con tres superficies principales:

- Landing pública y catálogo de empresas.
- Área autenticada para empresas participantes.
- Panel administrativo para operar el evento.

## Puntos de entrada

- `src/App.tsx`: define providers globales y todas las rutas.
- `src/pages/`: páginas de usuario final.
- `src/pages/admin/`: pantallas administrativas.

## Capas relevantes

- `src/api/`: acceso HTTP por dominio.
- `src/types/`: contratos TypeScript.
- `src/lib/axios.ts`: cliente Axios, interceptores y expiración de sesión.
- `src/store/userStore.ts`: estado persistido del usuario.
- `src/hooks/useAuth.ts`: fuente real del flujo de autenticación.

## Integración externa

- La aplicación depende de una API existente.
- El `baseURL` principal está hardcodeado a `https://rondadenegocios-api.trenquelauquen.gov.ar`.
- Hay instancia autenticada y pública para distintos endpoints.

## Validación habitual

- `npm run typecheck`
- `npm run lint`
- `npm run build`
