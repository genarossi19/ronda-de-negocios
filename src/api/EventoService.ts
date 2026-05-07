import api from "../lib/axios";
import type {
  EventoResponse,
  EventoUpdate,
  EventoWrite,
} from "../types/Evento";
export const getEventos = async (): Promise<EventoResponse[]> => {
  const { data } = await api.get<EventoResponse[]>("/eventos/");
  return data;
};

export async function createEvento(
  payload: EventoWrite,
): Promise<EventoResponse> {
  const { data } = await api.post<EventoResponse>("/eventos/", payload);
  return data;
}

export async function updateEvento(
  id: number,
  payload: Pick<EventoWrite, "estado">,
): Promise<EventoUpdate> {
  const { data } = await api.patch<EventoUpdate>(
    `/eventos/cambiar-estado/${id}/`,
    payload,
  );
  return data;
}

export async function deleteEvento(id: number) {
  const { data } = await api.delete(`/eventos/${id}/`);
  return data;
}

export async function notificarEvento(
  id: number,
): Promise<{ details?: string } | null> {
  const { data } = await api.post<{ details?: string }>(
    `/eventos/${id}/notificar/`,
  );
  return data ?? null;
}
