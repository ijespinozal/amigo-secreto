import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { homePathFor } from "./homePath";

/**
 * Páginas solo para invitados (login y registro). Con la sesión iniciada no
 * tiene sentido mostrarlas: se redirige a la pantalla de inicio del rol.
 */
export default function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={homePathFor(user)} replace />;
  return children;
}
