import api from "../lib/axios";
import type { GenericType } from "../types/GenericType";
export const getProvincias = async () => {
  const { data } = await api.get<GenericType[]>("/provincias/");
  return data;
};

export const getProvinciaById = async (id: number) => {
  const { data } = await api.get<GenericType>(`/provincias/${id}/`);
  return data;
};

export const createProvincia = async (provincia: GenericType) => {
  const { data } = await api.post("/provincias/", provincia);
  return data;
};

export const updateProvincia = async (id: number, provincia: GenericType) => {
  const { data } = await api.patch(`/provincias/${id}/`, provincia);
  return data;
};

export const deleteProvincia = async (id: number) => {
  const { data } = await api.delete(`/provincias/${id}/`);
  return data;
};
