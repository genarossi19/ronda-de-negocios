import type { GenericType } from "./GenericType";

export interface LocalidadResponse {
  id: number;
  provincia: GenericType;
  nombre: string;
  readOnly?: boolean;
}

export interface LocalidadWrite {
  provincia: number;
  nombre: string;
}

export type LocalidadUpdate = Partial<Omit<LocalidadResponse, "id">> & {
  id: number;
};
