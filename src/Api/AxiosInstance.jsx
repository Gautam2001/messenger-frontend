import axios from "axios";
import { PopupEventBus } from "../Pages/GlobalFunctions/GlobalPopup/PopupEventBus";

export const createAxiosInstance = (baseURL) => {
  const AxiosInstance = axios.create({
    baseURL,
    timeout: 15000,
  });

  AxiosInstance.interceptors.request.use(
    (config) => {
      const loginData = JSON.parse(
        sessionStorage.getItem("LoginData") ?? "null"
      );
      const token = loginData?.accessToken;

      const allowedUrls = [
        "/messenger/join",
        "/messenger/exists",
        "/auth/login",
      ];

      if (!allowedUrls.some((url) => config.url.includes(url)) && !token) {
        window.location.href = "/login";
      }

      if (token && !allowedUrls.some((url) => config.url.includes(url))) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  AxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error(
        "API Error:",
        error.response ? error.response.data : error.message
      );

      if (error.code === "ECONNABORTED") {
        PopupEventBus.emit("Request timed out. Please try again.", "error");
        return Promise.reject(new Error("Request timed out"));
      }

      if (error.response?.status === 401) {
        PopupEventBus.emit("Unauthorized. Please log in again.", "error");
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }
  );

  return AxiosInstance;
};
