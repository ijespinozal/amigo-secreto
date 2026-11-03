import { useEffect, useRef, useState } from "react";

// Premios del evento (pendiente: hacerlos gestionables por evento desde el admin).
const PRIZES = [
  { src: "/images/CANASTAUNO.png", name: "Canasta navideña" },
  { src: "/images/CANASTADOS.png", name: "Canasta navideña especial" },
  { src: "/images/AUDIFONOP9.jpg", name: "Audífonos P9" },
  { src: "/images/HUEVOS.jpg", name: "Hervidor de huevos eléctrico" },
  { src: "/images/LENTES.jpg", name: "Lentes bluetooth" },
  { src: "/images/LENTESSUNGLASSES.jpg", name: "Lentes bluetooth sunglasses" },
  { src: "/images/MINIVENTILADOR.jpg", name: "Mini ventilador personal" },
  { src: "/images/MORRAL.jpg", name: "Morral" },
  { src: "/images/SECADORA.jpg", name: "Secadora de cabello" },
  { src: "/images/PARLANTE.jpg", name: "Parlante inalámbrico" },
  { src: "/images/VENTILADOR.jpg", name: "Ventilador" },
  { src: "/images/TRAGOS.jpg", name: "Set de tragos" },
];

const AUTOPLAY_MS = 4000;

const arrowButton =
  "w-10 h-10 p-0 rounded-full bg-white hover:bg-gold-400/30 text-brand-strong border border-gold-400/60 shadow-sm " +
  "flex items-center justify-center transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold-300";

/** Carrusel de premios con desplazamiento nativo (táctil en celular), flechas, puntos y avance automático. */
export default function PrizeCarousel() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const itemWidth = () => {
    const track = trackRef.current;
    const first = track?.firstElementChild;
    if (!first) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  };

  const goTo = (index) => {
    const track = trackRef.current;
    if (!track) return;
    const lastIndex = PRIZES.length - 1;
    const target = index < 0 ? lastIndex : index > lastIndex ? 0 : index;
    track.scrollTo({ left: target * itemWidth(), behavior: "smooth" });
  };

  const handleScroll = () => {
    const width = itemWidth();
    if (width) setActive(Math.round(trackRef.current.scrollLeft / width));
  };

  // Avance automático (se pausa con el mouse encima o con el foco dentro).
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + itemWidth(), behavior: "smooth" });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Premios del evento"
      className="bg-cream-100 rounded-[var(--radius-panel)] p-5 sm:p-8 shadow-[var(--shadow-cozy)] border-2 border-gold-400/50 flex flex-col gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="font-festive font-bold text-2xl sm:text-3xl text-brand-strong tracking-tight">
          Premios del evento — ¡Mira lo que puedes ganar! <span aria-hidden="true">🎁</span>
        </h3>
        <div className="flex items-center gap-2">
          <button type="button" className={arrowButton} onClick={() => goTo(active - 1)} aria-label="Premio anterior">←</button>
          <button type="button" className={arrowButton} onClick={() => goTo(active + 1)} aria-label="Siguiente premio">→</button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {PRIZES.map((prize, index) => (
          <figure
            key={prize.src}
            aria-label={`Premio ${index + 1} de ${PRIZES.length}: ${prize.name}`}
            className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-10px)] md:w-[calc(33.333%-14px)] flex flex-col bg-white rounded-[var(--radius-card)] overflow-hidden border-2 border-gold-400/30 shadow-sm"
          >
            <div className="h-48 sm:h-52 w-full bg-white p-3">
              <img src={prize.src} alt={prize.name} loading="lazy" className="w-full h-full object-contain" />
            </div>
            <figcaption className="p-4 text-center font-festive font-bold text-lg text-brand-strong border-t border-gold-400/20">
              {prize.name}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {PRIZES.map((prize, index) => (
          <button
            key={prize.src}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Ir al premio ${index + 1}: ${prize.name}`}
            aria-current={index === active}
            className={`h-2.5 p-0 rounded-full transition-all ${index === active ? "w-7 bg-brand" : "w-2.5 bg-gold-400/60 hover:bg-gold-500"}`}
          />
        ))}
      </div>
    </section>
  );
}
