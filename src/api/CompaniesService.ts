import type { CompanyType } from "../types/companies";
import api from "../lib/axios";

export const getCompanies = async () => {
  const { data } = await api.get("/companies"); // /api se agrega automáticamente por el proxy
  return data;
};

export const getCompany = async (id: number): Promise<CompanyType> => {
  const { data } = await api.get("/", { params: { id } });
  return data;
};
