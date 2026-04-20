import { publicApi } from "../lib/axios";

export const login = async (email: string, password: string) => {
  const { data } = await publicApi.post("/acceso/login", { email, password });
  return data;
};
