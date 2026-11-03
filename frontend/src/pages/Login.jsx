import { useState } from "react";
import api, { getErrorMessage } from "../api";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AlertMessage from "../components/AlertMessage";
import AuthCard from "../components/auth/AuthCard";
import PasswordField from "../components/auth/PasswordField";
import PhoneField from "../components/auth/PhoneField";
import Button from "../components/ui/Button";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { login, sessionExpired, dismissSessionExpired } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { phone, password });
      const { token, user } = res.data;

      setAlert({ type: "success", title: "¡Bienvenido! 🎄", message: "Ingresando..." });

      login(token, user);

      setTimeout(() => {
        if (user.role === "admin") navigate("/admin/dashboard");
        else navigate("/user/home");
      }, 1000);

    } catch (err) {

      setAlert({
        type: "error",
        title: "Error al ingresar",
        message: getErrorMessage(err, "No pudimos iniciar sesión. Inténtalo de nuevo.")
      });
      setLoading(false);
    }
  };

  return (
    <>
      {/* ALERTA */}
      {alert ? (
        <AlertMessage
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      ) : sessionExpired && (
        <AlertMessage
          type="error"
          title="Sesión expirada"
          message="Tu sesión expiró. Vuelve a iniciar sesión."
          onClose={dismissSessionExpired}
        />
      )}

      <AuthCard
        title="¡Iniciar sesión!"
        subtitle="Ingresa para compartir la magia del intercambio familiar ✨"
        footer={
          <>
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-festive font-bold text-pine-700 hover:text-pine-800 hover:underline ml-1">
              Regístrate aquí ⭐
            </Link>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <PhoneField value={phone} onChange={setPhone} autoComplete="tel" />

          <PasswordField
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Ingresa tu clave"
            maxLength={255}
          />

          <Button type="submit" size="lg" block disabled={loading} className="mt-2 group">
            {loading ? "Ingresando..." : (
              <>
                <span>Entrar</span>
                <span aria-hidden="true" className="text-xl group-hover:rotate-12 transition-transform">🎁</span>
              </>
            )}
          </Button>
        </form>
      </AuthCard>
    </>
  );
}
