export interface EventoResponse {
  id: number;
  nombre: string;
  fecha: string;
  ubicacion: string;
  estado?: "activo" | "finalizado" | "cancelado";
  readOnly?: boolean;
}

export interface EventoWrite {
  nombre: string;
  fecha: string;
  ubicacion: string;
  estado: "activo" | "finalizado" | "cancelado";
}

export type EventoUpdate = Partial<Omit<EventoResponse, "id">> & { id: number };
