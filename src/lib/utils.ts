import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TurnoResponse } from "../types/Turno";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Obtiene el número secuencial de un turno basado en su hora de inicio
 * Los turnos se numeran 1, 2, 3... ordenados por hora_inicio
 */
export function getTurnoNumber(
  turno: TurnoResponse,
  allTurnos: TurnoResponse[],
): number {
  const sortedTurnos = [...allTurnos].sort((a, b) =>
    a.hora_inicio.localeCompare(b.hora_inicio),
  );

  const index = sortedTurnos.findIndex((t) => t.id === turno.id);
  return index === -1 ? 0 : index + 1;
}

/**
 * Crea un mapa de IDs de turnos a sus números secuenciales
 */
export function createTurnoNumberMap(
  turnos: TurnoResponse[],
): Map<number, number> {
  const sorted = [...turnos].sort((a, b) =>
    a.hora_inicio.localeCompare(b.hora_inicio),
  );

  const map = new Map<number, number>();
  sorted.forEach((turno, index) => {
    map.set(turno.id, index + 1);
  });

  return map;
}
