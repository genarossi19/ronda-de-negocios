export interface AsientoHistorialParticipante {
  empresa_nombre: string;
  representante_nombre: string;
  representante_apellido: string;
  representante_email: string;
  anfitriona: boolean;
  estado: string;
}

export interface AsientoHistorialItem {
  id: number;
  evento: string;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  num_mesa: number;
  participantes: AsientoHistorialParticipante[];
  estado: string;
}

export interface AsientoResponse {
  id: number;
  empresa_id: number;
  empresa_nombre: string;
  representante_nombre?: string;
  representante_apellido?: string;
  representante_email?: string;
  anfitriona?: boolean;
  readOnly?: boolean;
}

export interface AsientoWrite {
  mesa: number;
  empresa: number;
  representante: number;
}

export type AsientoUpdate = Partial<Omit<AsientoResponse, "id">> & {
  id: number;
};
