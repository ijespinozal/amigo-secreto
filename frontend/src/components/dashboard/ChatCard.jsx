import { Link } from "react-router-dom";

/**
 * Acceso a los mensajes secretos desde el inicio (solo después del sorteo),
 * con el total de mensajes nuevos.
 * @param {{ friend: { firstName, unread }, santa: { unread } }} chats
 */
export default function ChatCard({ chats }) {
  const unread = chats.friend.unread + chats.santa.unread;
  const target = chats.santa.unread > 0 && chats.friend.unread === 0 ? "/user/chat?con=santa" : "/user/chat";

  return (
    <Link
      to={target}
      className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6 bg-cream-100 rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border-2 border-pine-700/40 hover:border-pine-700 transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold-300"
    >
      <span aria-hidden="true" className="relative w-14 h-14 shrink-0 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl shadow-inner">
        💬
        {unread > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 ring-2 ring-cream-100 animate-pulse" />}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-festive font-bold text-xl text-brand-strong leading-snug">
          Mensajes secretos
          {unread > 0 && (
            <span className="ml-2 align-middle inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs">
              {unread} {unread === 1 ? "nuevo" : "nuevos"}
            </span>
          )}
        </h3>
        <p className="text-sm font-semibold text-ink-soft leading-relaxed mt-0.5">
          Pregúntale a {chats.friend.firstName} qué le gustaría sin revelar quién eres, y responde a tu Santa secreto 🎅
        </p>
      </div>
      <span className="shrink-0 py-2.5 px-5 rounded-full font-festive font-bold text-sm bg-pine-700 group-hover:bg-pine-800 text-white shadow-md text-center">
        Abrir chat <span aria-hidden="true">💌</span>
      </span>
    </Link>
  );
}
