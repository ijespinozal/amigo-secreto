import Badge from "../ui/Badge";
import IconButton from "../ui/IconButton";

/** Una opción de regalo registrada, con acciones de editar y eliminar. */
export default function GiftItem({ gift, position, onEdit, onDelete }) {
  return (
    <li
      aria-label={gift.title}
      className="flex items-start gap-3 p-4 bg-white rounded-[var(--radius-card)] border-2 border-gold-400/30 shadow-sm"
    >
      <span
        aria-hidden="true"
        className="w-8 h-8 shrink-0 rounded-full bg-gold-400/30 text-amber-900 font-festive font-bold flex items-center justify-center"
      >
        {position}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-festive font-bold text-lg text-brand-strong leading-snug break-words">{gift.title}</p>
        {gift.note && <p className="text-sm font-semibold text-ink-soft break-words whitespace-pre-line">{gift.note}</p>}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {gift.donation && <Badge tone="gold">🥧 Donación: {gift.donation}</Badge>}
          {gift.link && (
            <a
              href={gift.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-pine-700 hover:text-pine-800 underline underline-offset-2"
            >
              🔗 Ver link del regalo
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-1.5">
        <IconButton label={`Editar "${gift.title}"`} onClick={onEdit}>✏️</IconButton>
        <IconButton label={`Eliminar "${gift.title}"`} tone="danger" onClick={onDelete}>🗑️</IconButton>
      </div>
    </li>
  );
}
