import type {
  RepresentanteResponse,
  RepresentanteWrite,
} from "../types/Representante";
import api from "../lib/axios";

interface GetRepresentantesParams {
  nombre?: string;
  email?: string;
  search?: string;
  all?: boolean;
  empresa?: number;
}

export async function getRepresentantes(
  params: GetRepresentantesParams = {},
): Promise<RepresentanteResponse[]> {
  const query = new URLSearchParams();

  if (params.nombre) query.append("nombre", params.nombre);
  if (params.email) query.append("email", params.email);
  if (params.search) query.append("search", params.search);
  if (params.all) query.append("all", "true");
  if (params.empresa) query.append("empresa", params.empresa.toString());

  const { data } = await api.get<RepresentanteResponse[]>(
    `/representantes?${query.toString()}`,
  );

  return data;
}

export async function createRepresentante(
  payload: RepresentanteWrite,
): Promise<RepresentanteResponse> {
  const { data } = await api.post<RepresentanteResponse>(
    "/representantes/",
    payload,
  );
  return data;
}

export async function verificarEmailRepresentante(
  uidb64: string,
  token: string,
) {
  const { data } = await api.get(
    `/representantes/verificar-email-representante/${uidb64}/${token}/`,
  );

  return data;
}

export async function deleteRepresentante(id: number): Promise<void> {
  await api.delete(`/representantes/${id}/`);
}
