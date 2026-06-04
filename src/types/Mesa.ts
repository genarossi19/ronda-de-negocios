import type { AsientoResponse, AsientoWrite } from "./Asiento";

export interface MesaResponse {
  id: number;
  num_mesa: number;
  asientos: AsientoResponse[];
  fecha?: string;
  hora?: string;
  readOnly?: boolean;
}

export interface MesaEmpresaResponse {
  id: number;
  num_mesa: number;
}

export interface MesasEmpresaListResponse {
  mesas: MesaEmpresaResponse[];
}

export type MesaWrite = Omit<
  MesaResponse,
  "id" | "asientos" | "fecha" | "hora" | "readOnly"
> & {
  asientos?: AsientoWrite[];
};

export type MesaUpdate = Partial<Omit<MesaResponse, "id">> & { id: number };
