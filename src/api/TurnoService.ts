import type { TurnoEditar, TurnoResponse, TurnoWrite } from "../types/Turno";
import api from "../lib/axios";

export async function getTurnoByEventoId(
  eventoId: number,
): Promise<TurnoResponse[]> {
  const { data } = await api.get<TurnoResponse[]>(`/turnos/listar/${eventoId}`);
  return data;
}

export async function editTurno(
  turnoId: number,
  payload: TurnoEditar,
): Promise<TurnoResponse> {
  const { data } = await api.patch<TurnoResponse>(
    `/turnos/editar/${turnoId}/`,
    payload,
  );
  return data;
}

export async function createTurno(payload: TurnoWrite): Promise<TurnoResponse> {
  const { data } = await api.post<TurnoResponse>("/turnos/", payload);
  return data;
}

export async function deleteTurno(turnoId: number): Promise<void> {
  await api.delete(`/turnos/${turnoId}/`);
}
