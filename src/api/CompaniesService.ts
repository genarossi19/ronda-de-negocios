import type { CompanyResponse } from "../types/Company";
import api from "../lib/axios";

export const getCompanies = async () => {
  const { data } = await api.get("/empresas-public"); // /api se agrega automáticamente por el proxy
  return data;
};

export const getCompanyById = async (
  id: number | string
): Promise<CompanyResponse> => {
  const { data } = await api.get(`/empresas-public/${id}`);
  return data;
};
