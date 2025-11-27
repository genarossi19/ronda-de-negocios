export interface TurnoResponse {
  id: number;
  fecha?: string;
  mesas_ocupadas?: string;
  hora_inicio: string;
  hora_fin: string;
  cant_mesas: number;
  mesas_max_empresa?: number;
  estado: "activo" | "finalizado";
  evento: number;
}

export interface TurnoWrite {
  hora_inicio: string;
  hora_fin: string;
  cant_mesas: number;
  evento: number;
  estado: "activo" | "finalizado";
}

export type TurnoUpdate = Partial<Omit<TurnoResponse, "id">> & { id: number };

export interface TurnoEditar {
  estado?: "activo" | "finalizado";
  cant_mesas?: number;
}
