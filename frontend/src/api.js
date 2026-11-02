import axios from "axios";

const baseURL = import.meta.env.VITE_URL_SERVER;
if (!baseURL) {
  console.error("VITE_URL_SERVER no está definida: revisa .env.development / .env.production.");
}

const api = axios.create({
  baseURL,
  timeout: 10000
});

/** Se emite cuando el backend rechaza el token (vencido o inválido). */
export const AUTH_EXPIRED_EVENT = "auth:expired";

// Evento sobre el que opera el usuario; lo fija EventContext.
let activeEventId = null;
export const setActiveEventId = (eventId) => {
  activeEventId = eventId ?? null;
};

// attach token + evento activo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (activeEventId) config.headers["X-Event-Id"] = activeEventId;
  return config;
});

// Un 401 en una petición autenticada significa sesión vencida: AuthContext
// escucha este evento, cierra la sesión y lleva al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);

/** Mensaje legible de un error de la API. */
export const getErrorMessage = (error, fallback = "Ocurrió un error inesperado") =>
  error?.response?.data?.message || fallback;

/** Código de error estable enviado por el backend (p. ej. "NOT_PARTICIPANT"). */
export const getErrorCode = (error) => error?.response?.data?.code;

export default api;
