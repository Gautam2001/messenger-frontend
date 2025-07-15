import { createAxiosInstance } from "./AxiosInstance";

export const useApiClients = () => {
  const loginApi = createAxiosInstance(import.meta.env.VITE_LOGIN_URL);
  const messengerApi = createAxiosInstance(import.meta.env.VITE_MESSENGER_URL);

  return { loginApi, messengerApi };
};
