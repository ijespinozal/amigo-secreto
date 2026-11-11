import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { getErrorMessage } from "../../api";
import { CHAT_MESSAGE_MAX_LENGTH } from "../../config/rules";
import useChatThread from "../../hooks/useChatThread";
import useDialog from "../../hooks/useDialog";
import Spinner from "../Spinner";
import Button from "../ui/Button";

const SAME_DAY = { hour: "numeric", minute: "2-digit" };
const OTHER_DAY = { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" };

/** Hora del mensaje ("7:30 p. m.") o fecha y hora si no es de hoy. */
const formatTime = (iso) => {
  const date = new Date(iso);
  const today = new Date().toDateString() === date.toDateString();
  return date.toLocaleString("es-PE", today ? SAME_DAY : OTHER_DAY);
};

function Bubble({ message, otherLabel }) {
  const mine = message.mine;
  return (
    <li className={`flex flex-col max-w-[85%] ${mine ? "self-end items-end" : "self-start items-start"}`}>
      {!mine && <span className="text-xs font-bold text-ink-soft mb-0.5 ml-1">{otherLabel}</span>}
      <p
        className={`px-4 py-2.5 rounded-2xl text-[15px] font-semibold whitespace-pre-wrap break-words shadow-sm ${
          mine ? "bg-pine-700 text-white rounded-br-md" : "bg-white text-ink border border-gold-400/40 rounded-bl-md"
        }`}
      >
        {message.body}
      </p>
      <time dateTime={message.createdAt} className="text-[11px] font-semibold text-stone-500 mt-0.5 mx-1">
        {formatTime(message.createdAt)}
      </time>
    </li>
  );
}

/**
 * Conversación del chat secreto: mensajes, envío y sugerencias para empezar.
 * @param {"friend"|"santa"} thread
 * @param {string} otherLabel  cómo se muestra a la otra persona ("María", "🎅 Tu Santa secreto")
 * @param {string[]} suggestions  frases para empezar la conversación
 * @param {ReactNode} emptyHint
 */
export default function ChatThread({ thread, scope, otherLabel, suggestions = [], emptyHint, onPoll }) {
  const inputId = useId();
  const dialog = useDialog();
  const { messages, error, send } = useChatThread(thread, scope, onPoll);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const stickToBottom = useRef(true);

  // Al llegar mensajes nuevos se baja al final, salvo que el usuario esté
  // leyendo mensajes anteriores.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [messages]);

  // Al cambiar de conversación se empieza de nuevo abajo y sin borrador.
  useEffect(() => {
    stickToBottom.current = true;
    setDraft("");
  }, [thread]);

  const onScroll = () => {
    const list = listRef.current;
    stickToBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
  };

  const text = draft.trim();
  const submit = async (e) => {
    e?.preventDefault();
    if (!text || sending) return;
    setSending(true);
    try {
      await send(text);
      setDraft("");
      stickToBottom.current = true;
    } catch (err) {
      dialog.alert({ type: "error", title: "No se pudo enviar", message: getErrorMessage(err) });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Enter envía; Shift+Enter hace un salto de línea.
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
  };

  return (
    <div className="flex flex-col">
      <ol
        ref={listRef}
        onScroll={onScroll}
        aria-label="Mensajes"
        aria-live="polite"
        className="custom-scrollbar flex flex-col gap-3 h-[min(52vh,460px)] overflow-y-auto rounded-2xl bg-cream-50 border-2 border-gold-400/30 p-4"
      >
        {messages === null && !error && (
          <li className="m-auto" role="status" aria-label="Cargando mensajes"><Spinner /></li>
        )}
        {messages === null && error && (
          <li className="m-auto text-center text-sm font-semibold text-red-700">{getErrorMessage(error, "No pudimos cargar los mensajes.")}</li>
        )}
        {messages?.length === 0 && (
          <li className="m-auto text-center max-w-sm">
            <div aria-hidden="true" className="text-4xl mb-2">💌</div>
            <p className="text-sm font-semibold text-ink-soft">{emptyHint}</p>
          </li>
        )}
        {messages?.map((m) => <Bubble key={m.id} message={m} otherLabel={otherLabel} />)}
      </ol>

      {messages?.length === 0 && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3" aria-label="Sugerencias">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setDraft(s); inputRef.current?.focus(); }}
              className="px-3 py-1.5 rounded-full bg-white border border-gold-400/60 text-sm font-bold text-brand-strong hover:bg-gold-400/20 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="mt-3 flex items-end gap-2">
        <div className="flex-1 min-w-0">
          <label htmlFor={inputId} className="sr-only">Escribe un mensaje</label>
          <textarea
            id={inputId}
            ref={inputRef}
            rows={2}
            value={draft}
            maxLength={CHAT_MESSAGE_MAX_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Escribe un mensaje…"
            className="block w-full resize-none rounded-2xl bg-white border-2 border-amber-200/80 px-4 py-2.5 font-semibold text-ink placeholder:text-stone-400 focus:outline-none focus:border-pine-700 focus:ring-2 focus:ring-pine-700/20"
          />
          <p className="text-[11px] font-semibold text-stone-500 mt-1 ml-1">
            Enter para enviar · Shift+Enter para otra línea
            {draft.length > CHAT_MESSAGE_MAX_LENGTH * 0.8 && ` · ${draft.length}/${CHAT_MESSAGE_MAX_LENGTH}`}
          </p>
        </div>
        <Button type="submit" disabled={!text || sending} className="mb-6 shrink-0" aria-label="Enviar mensaje">
          {sending ? "..." : <>Enviar <span aria-hidden="true">📨</span></>}
        </Button>
      </form>
    </div>
  );
}
