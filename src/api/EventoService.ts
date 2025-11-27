import api from "../lib/axios";
import type { EventoResponse, EventoWrite } from "../types/Evento";
export const getEventos = async (): Promise<EventoResponse[]> => {
  const { data } = await api.get<EventoResponse[]>("/eventos/");
  return data;
};

export async function createEvento(
  payload: EventoWrite
): Promise<EventoResponse> {
  const { data } = await api.post<EventoResponse>("/eventos", payload);
  return data;
}
