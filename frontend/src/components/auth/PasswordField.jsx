import { useState } from "react";
import TextField from "../ui/TextField";

/** Campo de contraseña con candado y botón para mostrarla u ocultarla. */
export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      type={visible ? "text" : "password"}
      icon={<span className="text-lg">🔒</span>}
      suffix={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="w-8 h-8 p-0 rounded-full bg-transparent hover:bg-black/5 text-lg flex items-center justify-center"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          <span aria-hidden="true">{visible ? "🙈" : "👁️"}</span>
        </button>
      }
      required
      {...props}
    />
  );
}
