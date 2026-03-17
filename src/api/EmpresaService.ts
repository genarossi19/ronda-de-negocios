import type { EmpresaResponse, EmpresaWrite } from "../types/Empresa";
import api, { publicApi } from "../lib/axios";

export const getCompanies = async () => {
  const { data } = await publicApi.get("/empresas");
  return data;
};

export const getCompanyById = async (
  id: number | string,
): Promise<EmpresaResponse> => {
  const { data } = await api.get(`/empresas/${id}`);
  return data;
};

export const createCompany = async (company: EmpresaWrite) => {
  const { data } = await api.post("/empresas/registro/", company);
  return data;
};
