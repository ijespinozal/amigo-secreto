import { TrashIcon } from "@heroicons/react/24/solid";

export default function ParticipantList({ participants = [], onRemove }) {
  return (
    <div className="space-y-3 animate-fade-in max-w-3xl lg:max-w-4xl mx-auto">
      {participants.map(p => (
        <div
          key={p.id}
          className="p-4 bg-white border border-red-200/40 rounded-xl shadow-sm 
                     hover:shadow-md transition-all duration-200
                     flex items-center justify-between"  // 👈 alineación horizontal
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
          </div>

          {/* BOTÓN ELIMINAR */}
          <button
            onClick={() => onRemove(p.id)}
            className="h-10 w-[20%] max-w-[60px] flex items-center justify-center rounded-full !bg-red-600 hover:bg-red-600 text-white transition"
          >
            <TrashIcon className="w-5 h-5" /> {/* ícono */}
          </button>
        </div>
      ))}
    </div>
  );
}
