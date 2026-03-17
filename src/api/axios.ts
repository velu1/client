import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-fox-toast";
import Cookies from "js-cookie";

const baseURL = "http://127.0.0.1:6060";
// const baseURL = import.meta.env.VITE_API_BASE_URL;

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("x_access_token");
    const code = Cookies.get("code");
    if (token) {
      config.headers["x-access-token"] = token;
      config.headers["x-tenant-code"] = code;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (
      response.data?.toastMessage &&
      response.data.toastMessage !== "User details fetched successfully" &&
      response.data.toastMessage !== "Agreements fetched successfully" &&
      response.data.toastMessage !== "Services fetched successfully" &&
      response.data.toastMessage !== "Agreement created successfully"
    ) {
      toast.success(response.data.toastMessage);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    const response = error.response?.data as any;

    // Check if the error is 401 and the request is not a refresh token request
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes("/admin/auth/refresh-token") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Mark this request as retried

      if (isRefreshing) {
        // If token refresh is in progress, queue the failed request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["x-access-token"] = token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // isRefreshing = true;

      // try {
      //   const refreshToken = Cookies.get("refresh_token");
      //   if (!refreshToken) {
      //     throw new Error("No refresh token available");
      //   }

      //   const response = await axios.post(
      //     `${baseURL}/admin/auth/refresh-token`,
      //     {
      //       refresh_token: refreshToken,
      //     }
      //   );
      //   const { accessToken, tokenExpiresAt } = response.data.data;

      //   // Update cookies with new tokens
      //   Cookies.set("access_token", accessToken);
      //   Cookies.set("token_expires_at", tokenExpiresAt);

      //   // Update Authorization header
      //   originalRequest.headers["x-access-token"] = accessToken;

      //   // Process queued requests
      //   processQueue(null, accessToken);

      //   return axiosInstance(originalRequest);
      // } catch (refreshError) {
      //   processQueue(refreshError as Error);
      //   // Clear cookies and redirect to login
      //   Cookies.remove("access_token");
      //   Cookies.remove("refresh_token");
      //   Cookies.remove("token_expires_at");
      //   // window.location.href = "/login";
      //   return Promise.reject(refreshError);
      // } finally {
      //   isRefreshing = false;
      // }
    }

    // Handle other errors
    if (response?.toastMessage || error.message) {
      if (error.message === "canceled") {
        return;
      }
      console.log(
        response?.toastMessage || error.message || "Something went wrong"
      );
      // toast.error(error.message || error.data.data);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
