export default function Footer() {
  return (
    <footer className="w-full bg-red-600 text-white mt-12 py-4">
      <div className="text-center text-sm md:text-base font-semibold tracking-wide">
        © {new Date().getFullYear()} Amigo Secreto — Hecho con 🎄❤️🎁 IE
      </div>
    </footer>
  );
}
