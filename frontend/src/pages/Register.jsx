import { useState } from "react";
import api, { getErrorMessage } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { PASSWORD_MIN_LENGTH, PHONE_PATTERN } from "../config/rules";

import AlertMessage from "../components/AlertMessage";
import AuthCard from "../components/auth/AuthCard";
import PasswordField from "../components/auth/PasswordField";
import PhoneField from "../components/auth/PhoneField";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";

export default function Register() {
  const [phone, setPhone] = useState("");
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const navigate = useNavigate();

  const validate = () => {
    const next = {};
    if (!firstName.trim()) next.firstName = "Ingresa tus nombres.";
    if (!lastName.trim()) next.lastName = "Ingresa tus apellidos.";
    if (!PHONE_PATTERN.test(phone)) next.phone = "Ingresa un número de celular válido de 9 dígitos.";
    if (password.length < PASSWORD_MIN_LENGTH) next.password = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setAlert(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post("/auth/register", { phone, password, firstName, lastName });

      setAlert({ type: "success", message: "🎉 Cuenta creada correctamente. Inicia sesión." });
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setAlert({ type: "error", message: getErrorMessage(err, "Error al registrar") });
      setLoading(false);
    }
  };

  return (
    <>
      {alert && (
        <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      <AuthCard
        title="¡Crea tu cuenta!"
        subtitle="Únete al intercambio y registra tus opciones de regalo 🎄"
        footer={
          <>
            ¿Ya tienes cuenta?{" "}
            <Link to="/" className="font-festive font-bold text-pine-700 hover:text-pine-800 hover:underline ml-1">
              Inicia sesión 🎁
            </Link>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Nombres"
              placeholder="Ej: Ana"
              value={firstName}
              onChange={(e) => setFirst(e.target.value)}
              autoComplete="given-name"
              required
              maxLength={100}
              error={errors.firstName}
            />
            <TextField
              label="Apellidos"
              placeholder="Ej: Torres"
              value={lastName}
              onChange={(e) => setLast(e.target.value)}
              autoComplete="family-name"
              required
              maxLength={100}
              error={errors.lastName}
            />
          </div>

          <PhoneField value={phone} onChange={setPhone} autoComplete="tel" error={errors.phone} />

          <PasswordField
            label="Contraseña"
            placeholder={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={72}
            error={errors.password}
            hint={errors.password ? undefined : "Usa una que recuerdes; podrás cambiarla después."}
          />

          <Button type="submit" size="lg" block disabled={loading} className="mt-2">
            {loading ? "Creando cuenta..." : "Registrarme ⭐"}
          </Button>
        </form>
      </AuthCard>
    </>
  );
}
