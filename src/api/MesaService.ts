import type { MesaResponse } from "../types/Mesa";
import api from "../lib/axios";
export async function getMesasByTurnoId(
  turnoId: number
): Promise<MesaResponse[]> {
  const { data } = await api.get<MesaResponse[]>(`/mesas/listar/${turnoId}`);
  return data;
}
