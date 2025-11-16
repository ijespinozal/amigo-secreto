import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

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
      console.error(err);
      setAlert({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Error al registrar"
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
            />

            <input 
              className="input input-bordered w-full"
              placeholder="Apellidos"
              value={lastName}
              onChange={e => setLast(e.target.value)}
              required
            />

            <input 
              className="input input-bordered w-full"
              placeholder="Teléfono"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />

            <input 
              className="input input-bordered w-full"
              placeholder="Contraseña"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
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
