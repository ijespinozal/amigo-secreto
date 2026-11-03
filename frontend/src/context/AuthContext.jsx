import React, { useCallback, useEffect, useState } from "react";
import { AUTH_EXPIRED_EVENT } from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts";
import { SCHEDULE_SEEN_PREFIX } from "../utils/schedule";

const SESSION_KEYS = ["token", "user", "selectedEventId"];

/** Borra los datos de la sesión, incluido qué cronogramas ya vio (equipos compartidos). */
const clearSessionStorage = () => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  Object.keys(localStorage)
    .filter((key) => key.startsWith(SCHEDULE_SEEN_PREFIX) || key === "hasSeenChristmasTimeline")
    .forEach((key) => localStorage.removeItem(key));
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  // Aviso de "sesión expirada" para el login. Vive aquí y no en el estado de
  // la navegación: al limpiar el usuario, PrivateRoute redirige por su cuenta
  // y el estado de la ruta podría perderse según el orden de los renders.
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();

  const login = (tokenVal, userObj) => {
    localStorage.setItem("token", tokenVal);
    localStorage.setItem("user", JSON.stringify(userObj));
    setToken(tokenVal);
    setUser(userObj);
    setSessionExpired(false);
  };

  /** Actualiza los datos del usuario en sesión (p. ej. tras editar su perfil). */
  const updateUser = useCallback((userObj) => {
    localStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);
  }, []);

  /** @param {{ expired?: boolean }} [options] expired: la sesión venció (se avisa en el login) */
  const logout = useCallback(({ expired = false } = {}) => {
    clearSessionStorage();
    setToken(null);
    setUser(null);
    setSessionExpired(expired);
    navigate("/", { replace: true });
  }, [navigate]);

  const dismissSessionExpired = useCallback(() => setSessionExpired(false), []);

  // Token vencido o inválido (detectado por el interceptor de api.js).
  useEffect(() => {
    const handleExpired = () => {
      // Varias peticiones pueden fallar a la vez: solo la primera cierra la sesión.
      if (localStorage.getItem("token")) logout({ expired: true });
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser, sessionExpired, dismissSessionExpired }}>
      {children}
    </AuthContext.Provider>
  );
}
