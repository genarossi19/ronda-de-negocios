import type { MesasEmpresaListResponse, MesaResponse } from "../types/Mesa";
import api from "../lib/axios";
export async function getMesasByTurnoId(
  turnoId: number,
): Promise<MesaResponse[]> {
  const { data } = await api.get<MesaResponse[]>(`/mesas/listar/${turnoId}/`);
  return data;
}

export async function getMesasByEmpresaId(
  empresaId: number,
): Promise<MesasEmpresaListResponse> {
  const { data } = await api.get<MesasEmpresaListResponse>(
    `/mesas/mesas-empresa/${empresaId}/`,
  );
  return data;
}
