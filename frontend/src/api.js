import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_URL_SERVER,
  timeout: 10000
});

// attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
