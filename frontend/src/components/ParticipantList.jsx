import { TrashIcon } from "@heroicons/react/24/solid";
import { MAX_GIFTS_PER_PARTICIPANT } from "../config/rules";

/**
 * @param {boolean} [locked] sorteo realizado: no se permite quitar participantes
 */
export default function ParticipantList({ participants = [], onRemove, locked = false }) {
  if (participants.length === 0) {
    return (
      <p className="text-center text-sm text-white/90">
        Aún no hay participantes en este evento.
      </p>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in max-w-3xl lg:max-w-4xl mx-auto">
      {participants.map(p => (
        <div
          key={p.id}
          className="p-4 bg-white border border-red-200/40 rounded-xl shadow-sm
                     hover:shadow-md transition-all duration-200
                     flex items-center justify-between gap-3"
        >
          {/* Información principal */}
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-red-700 drop-shadow-sm">
              🎁 {p.firstName} {p.lastName}
            </p>

            <div className="text-sm text-gray-600 mt-1">
              {p.phone && <span>{p.phone}</span>}
              {p.email && (
                <span className="ml-2 text-gray-500">
                  • {p.email}
                </span>
              )}
            </div>

            {/* Estado del participante */}
            <div className="flex flex-wrap gap-2 mt-2 text-xs font-semibold">
              {p.registered ? (
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">✅ Registrado</span>
              ) : (
                <span
                  className="px-2 py-1 rounded-full bg-amber-100 text-amber-800"
                  title="Aún no creó su cuenta con este teléfono"
                >
                  ⏳ Sin cuenta
                </span>
              )}
              <span
                className={`px-2 py-1 rounded-full ${
                  p.giftsCount > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                🎁 {p.giftsCount}/{MAX_GIFTS_PER_PARTICIPANT} regalos
              </span>
            </div>
          </div>

          {/* BOTÓN ELIMINAR */}
          {!locked && (
            <button
              onClick={() => onRemove(p)}
              title="Quitar participante"
              className="h-10 w-[20%] max-w-[60px] flex items-center justify-center rounded-full !bg-red-600 hover:bg-red-600 text-white transition"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
