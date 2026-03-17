import api from "../lib/axios";
import type { LocalidadResponse, LocalidadWrite } from "../types/Localidad";

export const getLocalidades = async () => {
  const { data } = await api.get<LocalidadResponse[]>("/localidades/");
  return data;
};

export const getLocalidadById = async (id: number) => {
  const { data } = await api.get<LocalidadResponse>(`/localidades/${id}/`);
  return data;
};

export const createLocalidad = async (localidad: LocalidadWrite) => {
  const { data } = await api.post("/localidades/", localidad);
  return data;
};

export const updateLocalidad = async (
  id: number,
  localidad: LocalidadWrite,
) => {
  const { data } = await api.patch(`/localidades/${id}/`, localidad);
  return data;
};

export const deleteLocalidad = async (id: number) => {
  const { data } = await api.delete(`/localidades/${id}/`);
  return data;
};
