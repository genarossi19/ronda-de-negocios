import type { GenericType } from "../types/GenericType";
import api from "../lib/axios";

export const getSectors = async () => {
  const { data } = await api.get("/sectores/");
  return data;
};

export const createSector = async (sector: GenericType) => {
  const { data } = await api.post("/sectores/", sector);
  return data;
};

export const getSectorById = async (id: number) => {
  const { data } = await api.get(`/sectores/${id}`);
  return data;
};

export const deleteSector = async (id: number) => {
  const { data } = await api.delete(`/sectores/${id}`);
  return data;
};
