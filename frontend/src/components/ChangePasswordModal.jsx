import { useId, useState } from "react";
import api, { getErrorCode, getErrorMessage } from "../api";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../config/rules";
import useAuth from "../hooks/useAuth";
import useDialog from "../hooks/useDialog";
import { omit } from "../utils/object";
import PasswordField from "./auth/PasswordField";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

const EMPTY = { current: "", next: "", confirm: "" };

/** Errores por campo; vacío si el formulario es válido. */
const validate = ({ current, next, confirm }) => {
  const errors = {};
  if (!current) errors.current = "Ingresa tu contraseña actual.";
  if (next.length < PASSWORD_MIN_LENGTH) errors.next = `Debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  else if (next.length > PASSWORD_MAX_LENGTH) errors.next = `Admite máximo ${PASSWORD_MAX_LENGTH} caracteres.`;
  else if (current && next === current) errors.next = "Debe ser distinta a la actual.";
  if (!errors.next && confirm !== next) errors.confirm = "Las contraseñas no coinciden.";
  return errors;
};

// El envoltorio monta el formulario solo al abrir: así cada apertura empieza limpia.
export default function ChangePasswordModal({ open, onClose }) {
  if (!open) return null;
  return <ChangePasswordForm onClose={onClose} />;
}

function ChangePasswordForm({ onClose }) {
  const titleId = useId();
  const dialog = useDialog();
  const { user, login } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Al editar un campo se borra su error: el mensaje no queda desactualizado.
  const field = (name) => ({
    value: form[name],
    error: errors[name],
    onChange: (e) => {
      setForm((f) => ({ ...f, [name]: e.target.value }));
      setErrors((prev) => omit(prev, name));
    },
  });

  const submit = async (e) => {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const res = await api.post("/user/change-password", { currentPassword: form.current, newPassword: form.next });
      // El backend cierra las demás sesiones y entrega un token nuevo para esta.
      login(res.data.token, user);
      onClose();
      dialog.alert({ type: "success", icon: "🔐", title: "¡Contraseña actualizada!", message: res.data.message });
    } catch (err) {
      // Los errores de un campo concreto se muestran junto a ese campo.
      const code = getErrorCode(err);
      if (code === "WRONG_PASSWORD") setErrors({ current: "La contraseña actual no es correcta." });
      else if (code === "SAME_PASSWORD") setErrors({ next: "Debe ser distinta a la actual." });
      else setFormError(getErrorMessage(err, "No se pudo cambiar la contraseña. Inténtalo de nuevo."));
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={saving ? undefined : onClose} labelledBy={titleId} className="max-w-md p-6 sm:p-7">
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <div className="text-center">
          <div aria-hidden="true" className="text-4xl mb-1">🔐</div>
          <h2 id={titleId} className="font-festive font-bold text-2xl text-brand-strong">Cambiar contraseña</h2>
          <p className="text-sm font-semibold text-ink-soft mt-1">Por seguridad, primero confirma tu contraseña actual.</p>
        </div>

        {formError && (
          <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-800">
            ⚠️ {formError}
          </p>
        )}

        <fieldset disabled={saving} className="contents">
          <PasswordField label="Contraseña actual" autoComplete="current-password" {...field("current")} />
          <PasswordField
            label="Nueva contraseña"
            autoComplete="new-password"
            hint={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres.`}
            maxLength={PASSWORD_MAX_LENGTH}
            {...field("next")}
          />
          <PasswordField
            label="Confirmar nueva contraseña"
            autoComplete="new-password"
            maxLength={PASSWORD_MAX_LENGTH}
            {...field("confirm")}
          />

          <div className="flex gap-3 pt-1">
            <Button type="submit" block className="rounded-xl py-3">
              {saving ? "Guardando..." : "Guardar"}
            </Button>
            <Button variant="neutral" block onClick={onClose} className="rounded-xl py-3">
              Cancelar
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
