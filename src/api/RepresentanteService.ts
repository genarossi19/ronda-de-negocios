import type {
  RepresentanteResponse,
  RepresentanteWrite,
} from "../types/Representante";
import api from "../lib/axios";

interface GetRepresentantesParams {
  nombre?: string;
  email?: string;
  search?: string;
}

export async function getRepresentantes(
  params: GetRepresentantesParams = {},
): Promise<RepresentanteResponse[]> {
  const query = new URLSearchParams();

  if (params.nombre) query.append("nombre", params.nombre);
  if (params.email) query.append("email", params.email);
  if (params.search) query.append("search", params.search);

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
