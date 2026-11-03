import { useId } from "react";
import { formatScheduleTime, referenceLinkLabel } from "../utils/schedule";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

/** Una actividad del cronograma, como punto de una línea de tiempo. */
function ActivityItem({ activity: act }) {
  return (
    <li className="relative pl-14">
      {/* Punto de la línea de tiempo */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 w-11 h-11 rounded-full bg-white border-4 border-brand text-xl flex items-center justify-center shadow-md"
      >
        {act.icon || "⭐"}
      </span>

      <article className="bg-white rounded-[var(--radius-card)] border-2 border-gold-400/30 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pine-700 text-white font-festive font-bold text-xs">
            ⏰ {formatScheduleTime(act.startTime)}
          </span>
          {act.participantsLabel && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold-400/30 text-amber-900 font-festive font-bold text-xs">
              👥 {act.participantsLabel}
            </span>
          )}
        </div>

        <h3 className="font-festive font-bold text-lg text-brand-strong leading-snug mt-2 break-words">{act.title}</h3>
        {act.description && (
          <p className="text-sm font-semibold text-ink-soft mt-1 whitespace-pre-line break-words">{act.description}</p>
        )}

        {act.prizes.length > 0 && (
          <div className="mt-3 rounded-xl bg-cream-100 border border-gold-400/40 p-3">
            <p className="font-festive font-bold text-xs uppercase tracking-wider text-amber-900">🏆 Premios</p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {act.prizes.map((prize, idx) => (
                <li key={idx} className="px-2.5 py-1 rounded-full bg-white border border-gold-400/50 text-sm font-bold text-ink break-words">
                  {prize}
                </li>
              ))}
            </ul>
          </div>
        )}

        {act.referenceUrl && (
          <a
            href={act.referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-pine-700 hover:text-pine-800 underline underline-offset-2"
          >
            🎥 {referenceLinkLabel(act.referenceUrl)}
          </a>
        )}
      </article>
    </li>
  );
}

/**
 * Cronograma de actividades del evento. Los datos los gestiona el admin
 * (Panel > Evento > Cronograma); este componente solo los presenta.
 *
 * @param {Array}  activities  [{ id, startTime, title, description, participantsLabel, icon, referenceUrl, prizes[] }]
 * @param {string} [closeLabel]
 */
export default function ScheduleModal({ isOpen, onClose, activities = [], closeLabel = "¡Entendido, a jugar! 🎁" }) {
  const titleId = useId();

  return (
    <Modal open={isOpen} onClose={onClose} labelledBy={titleId} className="max-w-2xl">
      {/* Cabecera y pie fijos; solo las actividades se desplazan */}
      <header className="sticky top-0 z-10 px-6 py-5 text-center bg-linear-to-br from-page-from via-page-via to-page-to text-on-page border-b-2 border-gold-400/50">
        <h2 id={titleId} className="font-festive font-bold text-2xl sm:text-3xl tracking-tight drop-shadow-md">
          <span aria-hidden="true">🎄</span> Cronograma navideño <span aria-hidden="true">🎅</span>
        </h2>
        <p className="font-semibold text-on-page-accent text-sm mt-0.5">¡Prepárate para participar y ganar!</p>
      </header>

      <div className="px-4 sm:px-6 py-6">
        {activities.length === 0 ? (
          <p className="text-center font-semibold text-ink-soft">Aún no hay actividades en el cronograma.</p>
        ) : (
          <ol className="relative flex flex-col gap-5" aria-label="Actividades">
            {/* Línea vertical del tiempo */}
            <span aria-hidden="true" className="absolute left-[20px] top-2 bottom-2 w-1 rounded-full bg-gold-400/40" />
            {activities.map((act) => (
              <ActivityItem key={act.id} activity={act} />
            ))}
          </ol>
        )}
      </div>

      <footer className="sticky bottom-0 px-6 py-4 bg-cream-50/95 backdrop-blur border-t-2 border-gold-400/40 text-center">
        <Button size="lg" onClick={onClose} className="w-full sm:w-auto" data-autofocus>
          {closeLabel}
        </Button>
      </footer>
    </Modal>
  );
}
