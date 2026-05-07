import type { EmpresaResponse, EmpresaWrite } from "../types/Empresa";
import api from "../lib/axios";

export const getCompanies = async () => {
  const { data } = await api.get("/empresas");
  return data;
};

export const getCompanyById = async (
  id: number | string,
): Promise<EmpresaResponse> => {
  const { data } = await api.get(`/empresas/${id}`);
  return data;
};

export const approveCompany = async (id: number, aprobada: boolean) => {
  const { data } = await api.patch(
    `/empresas/cambiar-estado/${id}/${aprobada}/`,
  );
  return data;
};

export const deleteCompany = async (id: number): Promise<void> => {
  await api.delete(`/empresas/${id}/`);
};

export const validarEmail = async (uidb64: string, token: string) => {
  const { data } = await api.get(`/acceso/verificar-email/${uidb64}/${token}/`);
  return data;
};

export type EmpresaUpdatePayload = {
  razon_social?: string;
  descripcion?: string;
  telefono_contacto?: string;
  direccion?: string;
  sector?: number;
  localidad?: number;
};

export const updateCompany = async (
  id: number,
  payload: EmpresaUpdatePayload,
): Promise<EmpresaResponse> => {
  const { data } = await api.patch(`/empresas/${id}/`, payload);
  return data;
};

export const createCompany = async (company: EmpresaWrite) => {
  const formData = new FormData();

  formData.append("razon_social", company.razon_social);
  formData.append("cuit", company.cuit);
  formData.append("email", company.email);
  formData.append("password", company.password);
  formData.append("password2", company.password2);
  formData.append("telefono_contacto", company.telefono_contacto);
  formData.append("direccion", company.direccion);
  formData.append("localidad", String(company.localidad));
  formData.append("sector", String(company.sector));

  if (company.descripcion) {
    formData.append("descripcion", company.descripcion);
  }

  if (company.logo) {
    formData.append("logo", company.logo);
  }

  const { data } = await api.post("/empresas/registro/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
