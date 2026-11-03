// Objetos de contexto separados de sus Providers: así los archivos .jsx solo
// exportan componentes y el Fast Refresh de Vite funciona correctamente.
import { createContext } from "react";

export const AuthContext = createContext(null);
export const EventContext = createContext(null);
export const DialogContext = createContext(null);
