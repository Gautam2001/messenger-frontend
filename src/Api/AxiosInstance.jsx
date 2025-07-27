import axios from "axios";
import { PopupEventBus } from "../Pages/GlobalFunctions/GlobalPopup/PopupEventBus";
import { useApiClients } from "./useApiClients";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const createAxiosInstance = (baseURL) => {
  const AxiosInstance = axios.create({
    baseURL,
    timeout: 15000,
    withCredentials: true,
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
        "/auth/refresh",
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
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 498 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              return AxiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;

        try {
          const { loginApi } = useApiClients();

          const response = await loginApi.post("/auth/refresh");
          const newToken = response.data?.accessToken;

          if (!newToken) {
            throw new Error("No access token in refresh response");
          }

          // Update sessionStorage
          const loginData =
            JSON.parse(sessionStorage.getItem("LoginData") ?? "null") || {};
          loginData.accessToken = newToken;
          sessionStorage.setItem("LoginData", JSON.stringify(loginData));

          processQueue(null, newToken);

          originalRequest.headers["Authorization"] = "Bearer " + newToken;
          return AxiosInstance(originalRequest);
        } catch (err) {
          processQueue(err, null);
          PopupEventBus.emit("Session expired. Please log in again.", "error");
          sessionStorage.removeItem("LoginData");
          window.location.href = "/login";
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

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
