import api from "../lib/axios";
import type { GenericType } from "../types/GenericType";

export const getCargos = async () => {
  const { data } = await api.get<GenericType[]>("/cargos/");
  return data;
};

export const getCargoById = async (id: number) => {
  const { data } = await api.get<GenericType>(`/cargos/${id}/`);
  return data;
};

export const createCargo = async (cargo: GenericType) => {
  const { data } = await api.post("/cargos/", cargo);
  return data;
};

export const deleteCargo = async (id: number) => {
  const { data } = await api.delete(`/cargos/${id}/`);
  return data;
};

export const updateCargo = async (id: number, cargo: GenericType) => {
  const { data } = await api.patch(`/cargos/${id}/`, cargo);
  return data;
};
