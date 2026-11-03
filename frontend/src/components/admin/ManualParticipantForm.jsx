import { useState } from "react";
import api from "../../api";
import { PHONE_PATTERN } from "../../config/rules";
import PhoneField from "../auth/PhoneField";
import Button from "../ui/Button";
import TextField from "../ui/TextField";

const EMPTY = { firstName: "", lastName: "", phone: "" };

/**
 * Alta manual para personas que aún no tienen cuenta. Plegado por defecto:
 * la forma recomendada es buscar usuarios registrados (UserPicker).
 */
export default function ManualParticipantForm({ eventId, onAdded, onError }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.firstName.trim()) next.firstName = "El nombre es obligatorio.";
    if (!PHONE_PATTERN.test(form.phone)) next.phone = "El teléfono debe tener exactamente 9 dígitos.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const res = await api.post("/admin/participant", { eventId: Number(eventId), ...form });
      setForm(EMPTY);
      onAdded(res.data.participant);
    } catch (err) {
      onError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <details className="group rounded-[var(--radius-card)] border-2 border-dashed border-gold-400/50 bg-cream-50/60">
      <summary className="cursor-pointer list-none px-4 py-3 font-festive font-bold text-brand-strong flex items-center gap-2 select-none">
        <span aria-hidden="true" className="transition-transform group-open:rotate-90">▶</span>
        ¿La persona aún no tiene cuenta? Agrégala con su teléfono
      </summary>

      <form onSubmit={submit} noValidate className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p className="sm:col-span-2 text-xs font-semibold text-ink-soft bg-amber-50 border border-amber-200 rounded-xl p-3">
          ⚠️ Revisa bien el teléfono: cuando la persona se registre con <strong>ese mismo número</strong>,
          quedará vinculada automáticamente a este evento.
        </p>
        <TextField
          label="Nombre"
          value={form.firstName}
          onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
          maxLength={100}
          error={errors.firstName}
        />
        <TextField
          label="Apellido"
          value={form.lastName}
          onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
          maxLength={100}
          placeholder="Opcional"
        />
        <PhoneField
          className="sm:col-span-2"
          value={form.phone}
          onChange={(phone) => setForm((p) => ({ ...p, phone }))}
          error={errors.phone}
          required={false}
        />
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" variant="secondary" disabled={saving} className="w-full sm:w-auto">
            {saving ? "Agregando..." : "Agregar sin cuenta"}
          </Button>
        </div>
      </form>
    </details>
  );
}
