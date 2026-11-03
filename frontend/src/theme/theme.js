// Tema visual: "red" (Rojo Navideño) o "green" (Noche Mágica).
// index.html aplica el tema guardado antes del primer pintado; aquí se
// lee y se cambia en tiempo de ejecución. Los colores viven en index.css.

export const THEMES = Object.freeze({
  red: { label: "Rojo Navideño", icon: "🎄", themeColor: "#9B1C1C" },
  green: { label: "Noche Mágica", icon: "🎅", themeColor: "#0B3324" },
});

// Tema para quien nunca usó el botón (debe coincidir con <html data-theme> en index.html).
export const DEFAULT_THEME = "green";

const STORAGE_KEY = "theme";

export const getTheme = () => {
  const current = document.documentElement.dataset.theme;
  return current in THEMES ? current : DEFAULT_THEME;
};

export const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEMES[theme].themeColor);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Modo privado / almacenamiento bloqueado: el tema funciona igual, solo no se recuerda.
  }
};
