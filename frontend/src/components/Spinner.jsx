export default function Spinner() {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center">

      <div className="relative w-32 h-32 animate-spin">

        {/* 🎅 Círculo rojo externo */}
        <div className="absolute inset-0 border-4 border-red-500 rounded-full opacity-80"></div>

        {/* ❄ Círculo interno blanco */}
        <div className="absolute inset-3 border-4 border-white rounded-full opacity-80"></div>

        {/* 🌟 Estrella dorada */}
        <div className="absolute inset-0 flex justify-center items-center">
          <span className="text-yellow-400 text-5xl animate-pulse">⭐</span>
        </div>

        {/* 🎁 Regalo animado */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 animate-bounce">
          <span className="text-red-600 text-4xl">🎁</span>
        </div>
      </div>
    </div>
  );
}
