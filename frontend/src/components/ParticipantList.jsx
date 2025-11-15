export default function ParticipantList({ participants = [] }) {
  return (
    <div className="space-y-3 animate-fade-in">
      {participants.map(p => (
        <div
          key={p.id}
          className="p-4 bg-white border border-red-200/40 rounded-xl shadow-sm 
                     hover:shadow-md transition-all duration-200
                     flex flex-col sm:flex-row sm:items-center sm:justify-between
                     bg-cover bg-center"
        >
          {/* Información principal */}
          <div>
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

          {/* Sección flexible (para botones futuros si deseas) */}
          <div className="mt-3 sm:mt-0">
            {/* Placeholder para futuros botones de Admin/Edit/Remove */}
          </div>
        </div>
      ))}
    </div>
  );
}
