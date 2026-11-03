import PeruFlag from "../ui/PeruFlag";
import TextField from "../ui/TextField";

/** "987654321" -> "987 654 321" */
const formatPhone = (digits) => digits.replace(/(\d{3})(?=\d)/g, "$1 ");

/**
 * Teléfono peruano de 9 dígitos. Muestra el número agrupado para que sea fácil
 * de leer, pero entrega al padre solo los dígitos (lo que espera la API).
 * @param {string} value                solo dígitos
 * @param {(digits: string) => void} onChange
 */
export default function PhoneField({ value, onChange, label = "Teléfono (9 dígitos)", ...props }) {
  return (
    <TextField
      label={label}
      labelAside={<span className="inline-flex items-center gap-1 text-xs text-pine-700 font-extrabold"><PeruFlag className="w-4 h-3" /> Perú</span>}
      prefix={<><PeruFlag /><span>+51</span></>}
      type="tel"
      inputMode="numeric"
      placeholder="987 654 321"
      value={formatPhone(value)}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 9))}
      required
      {...props}
    />
  );
}
