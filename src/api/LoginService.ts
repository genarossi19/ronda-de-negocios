import api from "../lib/axios";

export const login = async (email: string, password: string) => {
  const { data } = await api.post("/login/", { email, password });
  return data;
};
