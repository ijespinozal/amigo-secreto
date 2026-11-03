import { useId, useState } from "react";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

/**
 * Muestra la contraseña temporal generada por el backend. Es la única vez que
 * se puede ver: en la base de datos solo queda su hash.
 */
export default function TemporaryPasswordModal({ open, userName, password, onClose }) {
  const titleId = useId();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const close = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={close} labelledBy={titleId} className="max-w-sm p-6 sm:p-7 text-center">
      <div aria-hidden="true" className="text-5xl mb-3">🔑</div>
      <h3 id={titleId} className="font-festive font-bold text-2xl text-pine-700">Contraseña temporal</h3>
      <p className="text-sm font-semibold text-ink-soft mt-1">
        Entrégasela a <strong>{userName}</strong> y pídele que la cambie al ingresar.
      </p>

      <div className="mt-5 flex items-center gap-2 rounded-xl bg-white border-2 border-gold-400/60 p-2 pl-4">
        <code className="flex-1 text-left text-2xl font-mono tracking-wider text-brand-strong select-all">{password}</code>
        <Button size="sm" onClick={copy}>{copied ? "¡Copiada!" : "Copiar"}</Button>
      </div>

      <p className="text-xs font-bold text-red-700 mt-3">⚠️ Esta contraseña no se volverá a mostrar.</p>

      <Button block onClick={close} className="mt-5 rounded-xl py-3">Listo</Button>
    </Modal>
  );
}
