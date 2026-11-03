export default function Footer() {
  return (
    // En celular el texto va a la izquierda y deja libre la franja derecha,
    // donde flotan los botones de tema y música.
    <footer className="relative z-10 w-full mt-12 bg-black/25 border-t border-gold-400/20 py-6 pl-5 pr-24 sm:px-4 text-left sm:text-center">
      <p className="font-festive text-sm font-semibold tracking-wide text-on-page-accent">
        © {new Date().getFullYear()} Amigo Secreto — Hecho con cariño navideño 🎄❤️ · IE
      </p>
    </footer>
  );
}
