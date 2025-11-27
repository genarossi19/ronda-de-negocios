import type { AsientoResponse, AsientoWrite } from "../types/Asiento";
import api from "../lib/axios";

export async function createAsiento(
  payload: AsientoWrite
): Promise<AsientoResponse> {
  const { data } = await api.post<AsientoResponse>("/asientos", payload);
  return data;
}
