import { useState } from "react";
import api, { getErrorMessage } from "../api";
import { useNavigate } from "react-router-dom";
import { PASSWORD_MIN_LENGTH, PHONE_PATTERN } from "../config/rules";

import Spinner from "../components/Spinner";
import AlertMessage from "../components/AlertMessage";

export default function Register() {
  const [phone, setPhone] = useState("");
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, type: "", message: "" });

    // 🔍 VALIDACIÓN DE CELULAR (solo Perú: 9 dígitos)
    if (!PHONE_PATTERN.test(phone)) {
      setLoading(false);
      setAlert({
        show: true,
        type: "error",
        message: "Ingrese un número de celular válido de 9 dígitos."
      });
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setLoading(false);
      setAlert({
        show: true,
        type: "error",
        message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
      });
      return;
    }

    try {
      await api.post("/auth/register", { 
        phone, 
        password, 
        firstName, 
        lastName 
      });

      setAlert({
        show: true,
        type: "success",
        message: "🎉 Cuenta creada correctamente. Inicia sesión."
      });

      setTimeout(() => navigate("/"), 1500);

    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: getErrorMessage(err, "Error al registrar")
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center mt-12 px-1 relative">

      {/* ALERTA CENTRADA */}
      {alert.show && (
        <AlertMessage 
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ show: false })}
        />
      )}

      <div className="w-full max-w-md">
        <div className="card bg-white/90 bg-base-100 shadow-lg p-6">

          <h2 className="text-2xl font-bold text-green-700">
            🤶🏼 Crear cuenta
          </h2>

          <form className="space-y-3 mt-4" onSubmit={submit}>

            <input 
              className="input input-bordered w-full"
              placeholder="Nombres"
              value={firstName}
              onChange={e => setFirst(e.target.value)}
              required
              maxLength={100}
            />

            <input
              className="input input-bordered w-full"
              placeholder="Apellidos"
              value={lastName}
              onChange={e => setLast(e.target.value)}
              required
              maxLength={100}
            />

            <input
              className="input input-bordered w-full"
              placeholder="Teléfono (9 dígitos)"
              inputMode="numeric"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
              required
              maxLength={9}
            />

            <input
              className="input input-bordered w-full"
              placeholder={`Contraseña (mín. ${PASSWORD_MIN_LENGTH} caracteres)`}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={72}
            />

            <button className="btn btn-primary w-full" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Registrarme"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
