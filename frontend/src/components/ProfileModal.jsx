import { useId, useState } from "react";
import api, { getErrorMessage } from "../api";
import useAuth from "../hooks/useAuth";
import useDialog from "../hooks/useDialog";
import { omit } from "../utils/object";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import TextField from "./ui/TextField";

const MAX_NAME_LENGTH = 100; // límite del backend (updateProfileSchema)

/** Errores por campo ({} si es válido). */
const validate = ({ firstName, lastName }) => {
  const errors = {};
  if (!firstName.trim()) errors.firstName = "Ingresa tu nombre.";
  if (!lastName.trim()) errors.lastName = "Ingresa tu apellido.";
  return errors;
};

// El envoltorio monta el formulario solo al abrir: cada apertura parte de los datos actuales.
export default function ProfileModal({ open, onClose }) {
  if (!open) return null;
  return <ProfileForm onClose={onClose} />;
}

function ProfileForm({ onClose }) {
  const titleId = useId();
  const dialog = useDialog();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ firstName: user.firstName ?? "", lastName: user.lastName ?? "" });
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

  const unchanged = form.firstName.trim() === user.firstName && form.lastName.trim() === (user.lastName ?? "");

  const submit = async (e) => {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;
    if (unchanged) return onClose();

    setSaving(true);
    try {
      const res = await api.put("/user/profile", { firstName: form.firstName.trim(), lastName: form.lastName.trim() });
      updateUser(res.data.user);
      onClose();
      dialog.alert({ type: "success", icon: "✏️", title: "¡Datos actualizados!", message: res.data.message });
    } catch (err) {
      setFormError(getErrorMessage(err, "No se pudieron guardar tus datos. Inténtalo de nuevo."));
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={saving ? undefined : onClose} labelledBy={titleId} className="max-w-md p-6 sm:p-7">
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Avatar firstName={form.firstName || user.firstName} lastName={form.lastName} size="lg" className="ring-4 ring-gold-400/50" />
          </div>
          <h2 id={titleId} className="font-festive font-bold text-2xl text-brand-strong">Mis datos</h2>
          <p className="text-sm font-semibold text-ink-soft mt-1">Así te verán los demás participantes en todos tus eventos.</p>
        </div>

        {formError && (
          <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-800">
            ⚠️ {formError}
          </p>
        )}

        <fieldset disabled={saving} className="contents">
          <TextField label="Nombre" autoComplete="given-name" maxLength={MAX_NAME_LENGTH} {...field("firstName")} />
          <TextField label="Apellido" autoComplete="family-name" maxLength={MAX_NAME_LENGTH} {...field("lastName")} />
          <TextField
            label="Teléfono"
            value={user.phone}
            readOnly
            disabled
            hint="El teléfono es tu usuario para ingresar: no se puede cambiar."
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
