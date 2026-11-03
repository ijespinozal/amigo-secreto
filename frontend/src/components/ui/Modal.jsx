import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Base de todos los modales. Se renderiza en un portal sobre <body> (así
 * ningún contenedor con z-index lo deja detrás del header), cierra con
 * Escape, mantiene el foco dentro del modal y lo devuelve al cerrar.
 *
 * @param {boolean} open
 * @param {() => void} [onClose]  si se omite, no se cierra con Escape ni con clic afuera
 * @param {string} [labelledBy]   id del título (accesibilidad)
 * @param {string} [className]    clases del panel
 *
 * El foco inicial va al elemento marcado con `data-autofocus` o, si no hay,
 * al primer elemento enfocable.
 */
export default function Modal({ open, onClose, labelledBy, className = "", children }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    (panel?.querySelector("[data-autofocus]") ?? panel?.querySelector(FOCUSABLE))?.focus();

    const handleKey = (e) => {
      if (e.key === "Escape" && onCloseRef.current) {
        e.stopPropagation();
        onCloseRef.current();
      }
      // Ciclo del foco dentro del modal
      if (e.key === "Tab" && panel) {
        const items = [...panel.querySelectorAll(FOCUSABLE)];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in"
        onClick={() => onCloseRef.current?.()}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative w-full max-h-[92vh] overflow-y-auto custom-scrollbar bg-cream-50 rounded-3xl shadow-2xl border-2 border-gold-400/50 animate-fade-in-up ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
