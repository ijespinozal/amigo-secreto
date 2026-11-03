import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";

/** Agrupa las donaciones por participante, conservando el orden. */
const groupByParticipant = (donations) => {
  const groups = new Map();
  for (const d of donations) {
    if (!groups.has(d.participantId)) {
      groups.set(d.participantId, { ...d, items: [] });
    }
    groups.get(d.participantId).items.push(d.donation);
  }
  return [...groups.values()];
};

/** Donaciones del evento; la propia fila se marca con "Tú". */
export default function DonationsCard({ donations = [], myParticipantId }) {
  const rows = groupByParticipant(donations);

  return (
    <section className="bg-cream-100 rounded-[var(--radius-panel)] p-5 sm:p-8 shadow-[var(--shadow-cozy)] border-2 border-gold-400/50 flex flex-col gap-5">
      <div>
        <h3 className="font-festive font-bold text-2xl sm:text-3xl text-brand-strong tracking-tight">
          Donaciones del evento <span aria-hidden="true">🥧</span>
        </h3>
        <p className="text-sm font-semibold text-ink-soft mt-1">
          Lo que cada integrante aportará para compartir en la reunión.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-ink-soft font-semibold italic">🎅 Aún no hay donaciones para este evento.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-200/70 border-b-2 border-gold-400/40 text-amber-950 font-festive font-bold text-sm sm:text-base">
                <th scope="col" className="py-3 px-4 sm:px-5 rounded-l-[var(--radius-card)]">Participante</th>
                <th scope="col" className="py-3 px-4 sm:px-5 rounded-r-[var(--radius-card)]">Donación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-400/20">
              {rows.map((row) => (
                <tr key={row.participantId} className="hover:bg-cream-50/80 transition-colors">
                  <td className="py-3.5 px-4 sm:px-5 align-top">
                    <div className="flex items-center gap-3">
                      <Avatar firstName={row.firstName} lastName={row.lastName} />
                      <div className="min-w-0">
                        <span className="font-festive font-bold text-base text-brand-strong block">
                          {row.firstName} {row.lastName}
                        </span>
                        {row.participantId === myParticipantId && <Badge tone="green" className="mt-0.5">Tú</Badge>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-bold text-base align-middle">
                    <ul className="space-y-1">
                      {row.items.map((item, i) => (
                        <li key={i} className="break-words">{item}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
