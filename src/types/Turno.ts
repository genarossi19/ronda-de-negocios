export interface TurnoResponse {
  id: number;
  fecha?: string;
  mesas_ocupadas: number;
  hora_inicio: string;
  hora_fin: string;
  cant_mesas: number;
  mesas_max_empresa?: number;
  estado: "abierto" | "cerrado" | "full";
  evento: number;
}

export interface TurnoWrite {
  hora_inicio: string;
  hora_fin: string;
  cant_mesas: number;
  evento: number;
  estado: "abierto" | "cerrado";
}

export type TurnoUpdate = Partial<Omit<TurnoResponse, "id">> & { id: number };

export interface TurnoEditar {
  estado?: "abierto" | "cerrado";
  cant_mesas?: number;
}
