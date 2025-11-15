import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { phone, password });
      const { token, user } = res.data;
      login(token, user);
      if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/user/home");
    } catch (err) {
      alert(err.response?.data?.message || "Error en login");
    }
  };

  return (
    <div className="flex justify-center px-6 py-10 md:py-20 bg-[url('/bg-christmas.jpg')] bg-cover bg-center min-h-screen items-start">
      <div className="w-full max-w-md drop-shadow-xl">

        <div className="bg-white/90 p-8 rounded-2xl border border-red-200 shadow-lg">
          <h2 className="text-3xl font-extrabold text-center text-green-700">
            🎄 Iniciar Sesión 🎁
          </h2>

          <form className="space-y-4 mt-6" onSubmit={submit}>
            <input
              className="input input-bordered w-full rounded-lg"
              placeholder="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              maxLength={9}
            />
            <input
              className="input input-bordered w-full rounded-lg"
              placeholder="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={255}
            />

            <button
              className="w-full bg-green-700 text-white font-semibold py-3 rounded-lg hover:bg-green-800 transition transform hover:scale-[1.02] shadow-md"
            >
              Entrar
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            ¿No tienes cuenta?{" "}
            <a
              href="/register"
              className="font-semibold text-red-600 hover:text-red-700"
            >
              Regístrate aquí
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
