import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/Spinner";
import AlertMessage from "../components/AlertMessage";
import Input from "../components/Input";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { phone, password });
      const { token, user } = res.data;

      setAlert({ type: "success", message: "¡Bienvenido! 🎄 Ingresando..." });

      login(token, user);

      setTimeout(() => {
        if (user.role === "admin") navigate("/admin/dashboard");
        else navigate("/user/home");
      }, 1200);

    } catch (err) {

      setAlert({
        type: "error",
        message: err.response?.data?.message || "Error en login ❌"
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ALERTA */}
      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* SPINNER EN PANTALLA COMPLETA */}
      {loading && (
        <div className="fixed inset-0 z-[999] bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <Spinner />
        </div>
      )}

      <div className="flex justify-center px-6 py-10 md:py-20 bg-[url('/bg-christmas.jpg')] bg-cover bg-center items-start">
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
              {/* <input
                className="input input-bordered w-full rounded-lg"
                placeholder="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={255}
              /> */}

              <div className="relative w-full">
                <input
                  className="input input-bordered w-full rounded-lg pr-12"
                  placeholder="Contraseña"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={255}
                />

                {/* Botón del ojo dentro del input sin afectar estilos globales */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  style={{
                    all: "unset",
                    position: "absolute",
                    right: "0.75rem",
                    top: "40%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    fontSize: "20px",
                    lineHeight: 1
                  }}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>

              <button
                className="w-full bg-green-700 text-white font-semibold py-3 rounded-lg hover:bg-green-800 transition transform hover:scale-[1.02] shadow-md"
              >
                Entrar
              </button>
            </form>

            <div className="mt-4 text-center text-sm">
              ¿No tienes cuenta?{" "}
              <Link
                to="/register"
                className="font-semibold text-red-600 hover:text-red-700"
              >
                Regístrate aquí
              </Link>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
