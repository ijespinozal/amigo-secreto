import { formatScheduleTime, referenceLinkLabel } from '../utils/schedule';

/**
 * Cronograma de actividades del evento. Los datos los gestiona el admin
 * (Panel > Evento > Cronograma); este componente solo los presenta.
 *
 * @param {Array}  activities  [{ id, startTime, title, description, participantsLabel, icon, referenceUrl, prizes[] }]
 * @param {string} [closeLabel]
 */
export default function ScheduleModal({ isOpen, onClose, activities = [], closeLabel = "¡Entendido, a jugar! 🎁" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Oscuro con Blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Contenedor del Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-title"
        className="relative w-full max-w-2xl bg-[#790000] border-2 border-[#ffdf80] rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp flex flex-col max-h-[90vh]"
      >

        {/* Cabecera Navideña */}
        <div className="bg-[#a80000] p-4 text-center border-b border-[#ffdf80]/50 relative">
          <div className="absolute top-2 left-4 text-2xl animate-bounce">🎄</div>
          <div className="absolute top-2 right-4 text-2xl animate-bounce delay-100">🎅</div>
          <h2 id="schedule-title" className="text-2xl font-bold text-white uppercase tracking-wider drop-shadow-md">
            Cronograma Navideño
          </h2>
          <p className="text-[#ffdf80] text-sm font-medium">¡Prepárate para ganar!</p>
        </div>

        {/* Cuerpo Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#900000] to-[#600000]">
          {activities.length === 0 ? (
            <p className="text-center text-white/80">Aún no hay actividades en el cronograma.</p>
          ) : (
          <div className="space-y-6 relative">
            {/* Línea vertical del tiempo */}
            <div className="absolute left-4 top-2 bottom-2 w-1 bg-[#ffdf80]/30 rounded-full"></div>

            {activities.map((act) => (
              <div key={act.id} className="relative pl-12 group">
                {/* Punto de tiempo */}
                <div className="absolute left-0 top-1 w-9 h-9 bg-white text-xl flex items-center justify-center rounded-full border-4 border-[#d00000] z-10 shadow-lg group-hover:scale-110 transition-transform">
                  {act.icon || "⭐"}
                </div>

                {/* Tarjeta de actividad */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="inline-block px-3 py-1 bg-[#0a9400] text-white text-xs font-bold rounded-full shadow-md w-fit">
                      ⏰ {formatScheduleTime(act.startTime)}
                    </span>
                    {act.participantsLabel && (
                      <span className="text-xs text-[#ffdf80] font-semibold border border-[#ffdf80]/50 px-2 py-0.5 rounded uppercase w-fit">
                        👥 {act.participantsLabel}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white leading-tight mb-1">
                    {act.title}
                  </h3>

                  {act.description && (
                    <p className="text-gray-200 text-sm italic mb-2 whitespace-pre-line">{act.description}</p>
                  )}

                  {act.prizes.length > 0 && (
                    <div className="mt-3 bg-black/20 rounded-lg p-3">
                      <p className="text-xs text-[#ffdf80] font-bold uppercase mb-1">🏆 Premios:</p>
                      <ul className="list-disc list-inside text-sm text-white/90 space-y-0.5">
                        {act.prizes.map((prize, idx) => (
                          <li key={idx}>{prize}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {act.referenceUrl && (
                    <a
                      href={act.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm text-[#ffdf80] hover:text-white hover:underline transition-colors"
                    >
                      🎥 {referenceLinkLabel(act.referenceUrl)}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#a80000] p-4 border-t border-[#ffdf80]/50 text-center">
          <button
            onClick={onClose}
            className="bg-[#0a9400] hover:bg-[#0cc000] text-white px-8 py-2 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all border border-white/30"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
