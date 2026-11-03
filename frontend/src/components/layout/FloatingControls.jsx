import { useCallback, useEffect, useRef, useState } from "react";
import { THEMES, applyTheme, getTheme } from "../../theme/theme";

const SONGS = ["/music/Navidad01.mp3", "/music/Navidad02.mp3", "/music/Navidad03.mp3"];
const MUSIC_PREF_KEY = "music";

// 48 px en celular (tamaño táctil estándar), 56 px desde sm.
const floatingButton =
  "w-12 h-12 sm:w-14 sm:h-14 p-0 rounded-full flex items-center justify-center text-xl sm:text-2xl border-2 border-white/80 " +
  "shadow-[var(--shadow-cozy)] transition-transform hover:scale-110 active:scale-95 " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold-300";

const readMusicPref = () => {
  try {
    return localStorage.getItem(MUSIC_PREF_KEY);
  } catch {
    return null;
  }
};

/**
 * Botones flotantes (abajo a la derecha):
 *  - Tema: alterna Rojo Navideño 🎄 / Noche Mágica 🎅.
 *  - Música: reproduce la lista en bucle. Los navegadores bloquean el audio
 *    hasta la primera interacción, así que arranca con el primer clic en la
 *    página, salvo que la persona la haya silenciado antes (se recuerda).
 */
export default function FloatingControls() {
  const [theme, setTheme] = useState(getTheme);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const songRef = useRef(0);

  const toggleTheme = () => {
    const next = theme === "red" ? "green" : "red";
    applyTheme(next);
    setTheme(next);
  };

  const play = useCallback(() => {
    audioRef.current
      ?.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false)); // autoplay bloqueado: queda en pausa
  }, []);

  const toggleMusic = (e) => {
    e.stopPropagation(); // no disparar el autoplay del primer clic
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      try { localStorage.setItem(MUSIC_PREF_KEY, "off"); } catch { /* sin almacenamiento */ }
    } else {
      try { localStorage.removeItem(MUSIC_PREF_KEY); } catch { /* sin almacenamiento */ }
      play();
    }
  };

  // Arranque con la primera interacción (si no fue silenciada antes).
  useEffect(() => {
    if (readMusicPref() === "off") return;
    const start = () => play();
    document.addEventListener("click", start, { once: true });
    return () => document.removeEventListener("click", start);
  }, [play]);

  const nextSong = () => {
    songRef.current = (songRef.current + 1) % SONGS.length;
    audioRef.current.src = SONGS[songRef.current];
    play();
  };

  const nextTheme = theme === "red" ? "green" : "red";

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[60] flex flex-col gap-2 sm:gap-3">
      <button
        type="button"
        onClick={toggleTheme}
        className={`${floatingButton} bg-cream-100 hover:bg-white`}
        title={`Cambiar a ${THEMES[nextTheme].label}`}
        aria-label={`Cambiar al tema ${THEMES[nextTheme].label}`}
      >
        <span aria-hidden="true">{THEMES[theme].icon}</span>
      </button>

      <button
        type="button"
        onClick={toggleMusic}
        className={`${floatingButton} bg-gold-500 hover:bg-gold-400 ${playing ? "ring-4 ring-gold-300/60" : ""}`}
        title={playing ? "Pausar música navideña" : "Reproducir música navideña"}
        aria-label={playing ? "Pausar música navideña" : "Reproducir música navideña"}
        aria-pressed={playing}
      >
        <span aria-hidden="true">{playing ? "🎶" : "🔇"}</span>
      </button>

      <audio ref={audioRef} src={SONGS[0]} onEnded={nextSong} preload="none" />
    </div>
  );
}
