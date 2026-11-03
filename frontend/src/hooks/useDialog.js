import { useContext } from "react";
import { DialogContext } from "../context/contexts";

/** Diálogos con el estilo de la app: { alert, confirm }. Nunca usar window.alert/confirm. */
export default function useDialog() {
  return useContext(DialogContext);
}
