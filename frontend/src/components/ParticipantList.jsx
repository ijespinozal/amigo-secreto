import { MAX_GIFTS_PER_PARTICIPANT } from "../config/rules";
import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import IconButton from "./ui/IconButton";

/**
 * Participantes de un evento.
 * @param {boolean} [locked] sorteo realizado: no se permite quitar participantes
 */
export default function ParticipantList({ participants = [], onRemove, locked = false }) {
  if (participants.length === 0) {
    return (
      <p className="text-center font-semibold text-ink-soft py-4">
        🎄 Aún no hay participantes en este evento. Agrégalos arriba.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
      {participants.map((p) => (
        <li
          key={p.id}
          aria-label={`${p.firstName} ${p.lastName ?? ""}`}
          className="flex items-center gap-3 p-4 bg-white rounded-[var(--radius-card)] border-2 border-gold-400/30 shadow-sm"
        >
          <Avatar firstName={p.firstName} lastName={p.lastName} />
          <div className="min-w-0 flex-1">
            <p className="font-festive font-bold text-brand-strong truncate">{p.firstName} {p.lastName}</p>
            <p className="text-xs font-semibold text-ink-soft tabular-nums">
              {p.phone}{p.email && ` · ${p.email}`}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {p.registered ? (
                <Badge tone="green">✅ Registrado</Badge>
              ) : (
                <Badge tone="gold" className="cursor-help">
                  <span title="Aún no creó su cuenta con este teléfono">⏳ Sin cuenta</span>
                </Badge>
              )}
              <Badge tone={p.giftsCount > 0 ? "blue" : "gray"}>🎁 {p.giftsCount}/{MAX_GIFTS_PER_PARTICIPANT}</Badge>
            </div>
          </div>
          {!locked && (
            <IconButton label="Quitar participante" tone="danger" onClick={() => onRemove(p)}>🗑️</IconButton>
          )}
        </li>
      ))}
    </ul>
  );
}
