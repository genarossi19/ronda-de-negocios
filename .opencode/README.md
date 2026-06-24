# OpenCode del proyecto

Esta carpeta deja preparado `opencode` para trabajar mejor sobre el frontend de **Ronda de Negocios**.

## Qué incluye

- `opencode.json`: configuración del proyecto, comandos y contexto cargado por defecto.
- `agents/`: agentes específicos para este repositorio.
- `skills/`: skills reutilizables para tareas frecuentes del proyecto.
- `context/`: documentación breve y estable para dar contexto adicional al modelo.

## Criterios usados

- Priorizar cambios locales antes que refactors amplios.
- Mantener el idioma funcional en español.
- Revisar primero rutas, páginas y APIs del dominio afectado.
- Verificar con `typecheck`, `lint` y `build` cuando el cambio lo amerite.
- Mantener `README.md` y `AGENTS.md` sincronizados si cambia el comportamiento principal.

## Estructura

```text
.opencode/
  opencode.json
  README.md
  agents/
  skills/
  context/
```

## Nota

Después de cambiar cualquier archivo de esta carpeta, hay que reiniciar `opencode` para que tome la nueva configuración.
