export interface AsientoResponse {
  id: number;
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
