import axios, { AxiosRequestConfig, RawAxiosRequestHeaders } from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const apiClient = axios.create({
  baseURL: apiBaseUrl
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetryConfig = AxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const config = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const isAuthEndpoint = config?.url?.includes("/auth/");

    if (status === 401 && config && !config._retry && !isAuthEndpoint) {
      config._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post<{
            accessToken: string;
            refreshToken: string;
            user: unknown;
          }>(`${apiBaseUrl}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh, user } = res.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefresh);
          localStorage.setItem("currentUser", JSON.stringify(user));
          if (config.headers) {
            (config.headers as RawAxiosRequestHeaders)["Authorization"] = `Bearer ${accessToken}`;
          } else {
            config.headers = { Authorization: `Bearer ${accessToken}` } as RawAxiosRequestHeaders;
          }
          return apiClient(config);
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("currentUser");
          window.location.assign("/login");
          return Promise.reject(error);
        }
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("currentUser");
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
