import { useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../../api";
import Card from "../../components/Card";
import ChatThread from "../../components/chat/ChatThread";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";
import { EmptyState, PageError, PageLoading } from "../../components/ui/PageStatus";
import useApiData from "../../hooks/useApiData";
import useEvents from "../../hooks/useEvents";
import useRequireEvent from "../../hooks/useRequireEvent";

const FRIEND_SUGGESTIONS = ["¿Qué talla de ropa usas? 👕", "¿Cuál es tu color favorito? 🎨", "¿Dulce o salado? 🍫", "¿Qué hobby tienes? 🎮"];
const SANTA_SUGGESTIONS = ["¡Hola, Santa! 🎅", "Soy talla M 👕", "Me encanta el chocolate 🍫", "¡Gracias por pensar en mí! 🎁"];

/** Pestaña de conversación con aviso de mensajes nuevos. */
function Tab({ active, onClick, icon, label, unread, id, controls }) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      className={`relative flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-3 rounded-2xl font-festive font-bold text-sm sm:text-base transition-colors ${
        active ? "bg-cream-100 text-brand-strong shadow-md" : "bg-white/10 text-on-page hover:bg-white/20"
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="truncate">{label}</span>
      {unread > 0 && (
        <span className="shrink-0 min-w-6 h-6 px-1.5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center" aria-label={`${unread} mensajes nuevos`}>
          {unread}
        </span>
      )}
    </button>
  );
}

/** Mensajes secretos: con mi amigo secreto y con mi Santa secreto (anónimo). */
export default function SecretChat() {
  const { ready, selectedEvent, selectedEventId, error: eventsError, reload: reloadEvents } = useEvents();
  const hasEvent = ready && selectedEventId !== null;
  const redirectingNoEvent = useRequireEvent();
  const [params, setParams] = useSearchParams();
  const thread = params.get("con") === "santa" ? "santa" : "friend";

  const summary = useApiData("/user/chats", { enabled: hasEvent, scope: selectedEventId });

  if (!ready || redirectingNoEvent || (hasEvent && !summary.data && !summary.error && !eventsError)) return <PageLoading />;

  if (eventsError || summary.error) {
    return (
      <PageError
        message={getErrorMessage(summary.error, "No pudimos cargar tus mensajes. Revisa tu conexión e inténtalo de nuevo.")}
        onRetry={eventsError ? () => reloadEvents().catch(() => {}) : summary.reload}
        retrying={summary.loading}
      />
    );
  }

  const header = (
    <PageHeader title="Mensajes secretos" emoji="💬" subtitle={`${selectedEvent?.title ?? ""} · Conversa sin revelar quién eres.`} />
  );

  if (!summary.data.available) {
    return (
      <div className="flex flex-col gap-8 animate-fade-in">
        {header}
        <Card className="max-w-xl mx-auto">
          <EmptyState icon="⏳" title="Aún no hay sorteo">
            Cuando el administrador realice el sorteo podrás escribirle a tu amigo secreto, y tu Santa secreto podrá escribirte a ti.
          </EmptyState>
          <div className="text-center">
            <Button to="/user/home" variant="secondary" size="sm">Volver a Mi espacio</Button>
          </div>
        </Card>
      </div>
    );
  }

  const { friend, santa } = summary.data;
  const select = (next) => setParams(next === "santa" ? { con: "santa" } : {}, { replace: true });
  const isFriend = thread === "friend";

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {header}

      <div role="tablist" aria-label="Conversaciones" className="flex gap-2 p-1.5 rounded-3xl bg-black/15 max-w-2xl w-full">
        <Tab
          id="tab-friend"
          controls="panel-chat"
          active={isFriend}
          onClick={() => select("friend")}
          icon="🎁"
          label={`${friend.firstName} (le regalas)`}
          unread={isFriend ? 0 : friend.unread}
        />
        <Tab
          id="tab-santa"
          controls="panel-chat"
          active={!isFriend}
          onClick={() => select("santa")}
          icon="🎅"
          label="Mi Santa secreto"
          unread={isFriend ? santa.unread : 0}
        />
      </div>

      <Card className="max-w-2xl w-full">
        <div role="tabpanel" id="panel-chat" aria-labelledby={isFriend ? "tab-friend" : "tab-santa"}>
          <p className="mb-4 text-sm font-bold text-brand bg-brand-soft rounded-xl px-4 py-3">
            {isFriend
              ? `🔒 ${friend.firstName} verá tus mensajes como "Tu Santa secreto": no sabrá que eres tú.`
              : "🔒 Quien te regala te escribe en secreto: no sabrás quién es. Puedes responderle o darle pistas de lo que te gusta."}
          </p>
          <ChatThread
            key={`${selectedEventId}:${thread}`}
            thread={thread}
            scope={selectedEventId}
            onPoll={summary.reload}
            otherLabel={isFriend ? friend.firstName : "🎅 Tu Santa secreto"}
            suggestions={isFriend ? FRIEND_SUGGESTIONS : SANTA_SUGGESTIONS}
            emptyHint={
              isFriend
                ? `Hazle una pregunta a ${friend.firstName} para acertar con su regalo. ¡No te delates! 🤫`
                : "Tu Santa secreto aún no te ha escrito. Puedes escribirle tú: cuéntale qué te gustaría recibir."
            }
          />
        </div>
      </Card>
    </div>
  );
}
