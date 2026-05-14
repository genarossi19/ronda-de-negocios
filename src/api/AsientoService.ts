import type {
  AsientoResponse,
  AsientoWrite,
  AsientoHistorialItem,
} from "../types/Asiento";
import api from "../lib/axios";

export async function getAsientoHistorial(
  empresaId: number,
): Promise<AsientoHistorialItem[]> {
  const { data } = await api.get<AsientoHistorialItem[]>(
    `/asientos/historial/${empresaId}/`,
  );
  return data;
}

export async function createAsiento(
  payload: AsientoWrite,
): Promise<AsientoResponse> {
  const { data } = await api.post<AsientoResponse>("/asientos/", payload);
  return data;
}

export async function updateAsiento(
  id: number,
  payload: Partial<AsientoWrite>,
): Promise<AsientoResponse> {
  const { data } = await api.patch<AsientoResponse>(
    `/asientos/${id}/`,
    payload,
  );
  return data;
}

export async function cancelAsiento(id: number): Promise<void> {
  await api.delete(`/asientos/${id}/cancelar/`);
}

export async function deleteAsiento(id: number): Promise<void> {
  await api.delete(`/asientos/${id}/`);
}
