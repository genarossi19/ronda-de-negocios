import { publicApi } from "../lib/axios";

export const login = async (email: string, password: string) => {
  const { data } = await publicApi.post("/acceso/login", { email, password });
  return data;
};

export const requestPasswordReset = async (email: string) => {
  const { data } = await publicApi.post("/acceso/resetear-password/", {
    email,
  });
  return data;
};

export const resetPassword = async (
  uidb64: string,
  token: string,
  password: string,
  passwordConfirm: string,
) => {
  const { data } = await publicApi.post(
    `/acceso/nueva-password/${uidb64}/${token}/`,
    { password, password2: passwordConfirm },
  );
  return data;
};
