import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [phone, setPhone] = useState("");
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { phone, password, firstName, lastName });
      alert("Cuenta creada. Inicia sesión.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al registrar");
    }
  };

  return (
    <div className="flex justify-center mt-12 px-4">
      <div className="w-full max-w-md">
        <div className="card bg-white/90 bg-base-100 shadow-lg p-6">
          <h2 className="text-2xl font-bold text-green-700">🤶🏼 Crear cuenta</h2>
          <form className="space-y-3 mt-4" onSubmit={submit}>
            <input className="input input-bordered w-full" placeholder="Nombres" value={firstName} onChange={e=>setFirst(e.target.value)} required />
            <input className="input input-bordered w-full" placeholder="Apellidos" value={lastName} onChange={e=>setLast(e.target.value)} required />
            <input className="input input-bordered w-full" placeholder="Teléfono" value={phone} onChange={e=>setPhone(e.target.value)} required />
            <input className="input input-bordered w-full" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <button className="btn btn-primary w-full">Registrarme</button>
          </form>
        </div>
      </div>
    </div>
  );
}
