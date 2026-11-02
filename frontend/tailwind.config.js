// NOTA: con Tailwind v4 + @tailwindcss/vite este archivo NO se carga, porque
// src/index.css no lo referencia con `@config`. Por eso DaisyUI tampoco está activo.
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
};
