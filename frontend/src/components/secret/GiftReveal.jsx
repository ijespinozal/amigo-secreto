import { useEffect, useRef, useState } from "react";
import { secretRevealedKey } from "../../utils/reveal";

const OPEN_DURATION_MS = 900;
const CONFETTI_DURATION_MS = 2600;
const CONFETTI_COLORS = ["#f9cf6e", "#f4b942", "#dc2626", "#16a34a", "#fff8ee", "#60a5fa", "#f472b6"];

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const storage = {
  has: (key) => {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  },
  set: (key) => {
    try {
      localStorage.setItem(key, "1");
    } catch {
      // Sin almacenamiento (modo privado): la sorpresa se mostrará de nuevo.
    }
  },
};

/** Piezas de confeti con destino, giro y duración al azar (se generan al abrir). */
const makeConfetti = (count = 70) =>
  Array.from({ length: count }, (_, id) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 45; // en vmin
    return {
      id,
      color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
      round: id % 3 === 0,
      style: {
        "--x": `${Math.cos(angle) * distance}vmin`,
        "--y": `${Math.sin(angle) * distance + 25}vmin`, // cae un poco
        "--r": `${Math.round(Math.random() * 720 - 360)}deg`,
        "--d": `${1.4 + Math.random() * 1}s`,
        width: `${6 + Math.random() * 6}px`,
        height: `${8 + Math.random() * 8}px`,
      },
    };
  });

function Confetti({ pieces }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[8000] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`confetti-piece ${p.round ? "rounded-full" : "rounded-[2px]"}`}
          style={{ ...p.style, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

/** Caja de regalo dibujada con CSS (toma los colores del tema). */
function GiftBox({ opening }) {
  return (
    <span aria-hidden="true" className={`relative block w-44 h-44 sm:w-52 sm:h-52 ${opening ? "" : "gift-wobble"}`}>
      {/* Halo dorado para que la caja resalte sobre el fondo */}
      <span className="absolute -inset-6 rounded-full bg-gold-300/30 blur-2xl" />
      {/* Tapa con moño */}
      <span className={`absolute left-[4%] right-[4%] top-[18%] h-[22%] z-10 ${opening ? "gift-lid-open" : ""}`}>
        <span className="absolute inset-0 rounded-lg bg-gift shadow-lg border-2 border-cream-100/80" />
        <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[16%] bg-gold-400" />
        <span className="absolute -top-[62%] left-1/2 -translate-x-[105%] w-[30%] h-[75%] rounded-full border-[7px] border-gold-400 rotate-[-25deg]" />
        <span className="absolute -top-[62%] left-1/2 translate-x-[5%] w-[30%] h-[75%] rounded-full border-[7px] border-gold-400 rotate-[25deg]" />
      </span>
      {/* Cuerpo */}
      <span className={`absolute left-[10%] right-[10%] top-[38%] bottom-[4%] ${opening ? "gift-box-open" : ""}`}>
        <span className="absolute inset-0 rounded-b-xl bg-gift-dark shadow-[var(--shadow-cozy)] border-2 border-cream-100/80" />
        <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[18%] bg-gold-500" />
        <span className="absolute inset-x-0 top-0 h-[14%] bg-black/15" />
      </span>
    </span>
  );
}

/**
 * Revelación del amigo secreto: la primera vez se muestra una caja de regalo
 * que se abre con un toque (con confeti); después, el contenido directo.
 * El padre debe montarlo con `key` por evento y amigo.
 *
 * @param {number} eventId
 * @param {number} friendId  participante asignado (cambia si se repite el sorteo)
 * @param {ReactNode} children  el contenido revelado
 */
export default function GiftReveal({ eventId, friendId, children }) {
  const key = secretRevealedKey(eventId, friendId);
  const [stage, setStage] = useState(() => (storage.has(key) ? "revealed" : "closed"));
  const [confetti, setConfetti] = useState(null);
  const timers = useRef([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const open = () => {
    if (stage !== "closed") return;
    storage.set(key);
    if (prefersReducedMotion()) {
      setStage("revealed");
      return;
    }
    setStage("opening");
    later(() => {
      setConfetti(makeConfetti());
      setStage("revealed");
      later(() => setConfetti(null), CONFETTI_DURATION_MS);
    }, OPEN_DURATION_MS);
  };

  if (stage === "revealed") {
    return (
      <>
        {confetti && <Confetti pieces={confetti} />}
        <div className={confetti ? "reveal-in" : ""}>{children}</div>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setStage("closed")}
            className="text-sm font-bold text-on-page/80 hover:text-on-page underline underline-offset-4"
          >
            🎁 Ver la sorpresa otra vez
          </button>
        </div>
      </>
    );
  }

  return (
    <section className="flex flex-col items-center text-center py-6 sm:py-10">
      <button
        type="button"
        onClick={open}
        disabled={stage === "opening"}
        aria-label="Abrir el regalo para descubrir a tu amigo secreto"
        className="rounded-3xl p-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold-300 cursor-pointer disabled:cursor-default"
      >
        <GiftBox opening={stage === "opening"} />
      </button>
      <p className="mt-6 font-festive font-bold text-2xl sm:text-3xl text-on-page drop-shadow-md">
        {stage === "opening" ? "¡Abriendo…! ✨" : "Toca el regalo para descubrir a quién le regalas"}
      </p>
      <p className="mt-2 font-semibold text-on-page/85">🤫 Asegúrate de que nadie esté mirando tu pantalla.</p>
    </section>
  );
}
