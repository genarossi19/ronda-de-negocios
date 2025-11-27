import api from "../lib/axios";
import type { EventoResponse } from "../types/Evento";
export const getEventos = async (): Promise<EventoResponse[]> => {
  const { data } = await api.get<EventoResponse[]>("/eventos/");
  return data;
};
