import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../../api";
import useAuth from "../../hooks/useAuth";
import useDialog from "../../hooks/useDialog";
import useApiData from "../../hooks/useApiData";
import useEvents from "../../hooks/useEvents";
import ScheduleModal from "../../components/ScheduleModal";
import ActionCard from "../../components/dashboard/ActionCard";
import CountdownHero from "../../components/dashboard/CountdownHero";
import DonationsCard from "../../components/dashboard/DonationsCard";
import PrizeCarousel from "../../components/dashboard/PrizeCarousel";
import Badge from "../../components/ui/Badge";
import { SHOW_PRIZE_CAROUSEL } from "../../config/features";
import { MAX_GIFTS_PER_PARTICIPANT } from "../../config/rules";
import { scheduleSeenKey } from "../../utils/schedule";
import { NO_EVENT_DIALOG, NOT_DRAWN_DIALOG } from "../../config/messages";

export default function UserDashboard() {
  const { user } = useAuth();
  const dialog = useDialog();
  const navigate = useNavigate();
  // Tarjeta cuya acción se está consultando al servidor ("gifts" | "secret" | "group").
  const [busyCard, setBusyCard] = useState(null);
  const { ready, selectedEvent, selectedEventId, reload: reloadEvents } = useEvents();
  const eventScope = { enabled: ready && selectedEventId !== null, scope: selectedEventId };

  const { data: donationsData } = useApiData("/user/donations", eventScope);
  const { data: gifts } = useApiData("/user/gifts", eventScope);

  // Cronograma del evento: solo existe si el admin lo creó y lo publicó.
  const { data: schedule } = useApiData("/user/schedule", eventScope);
  const hasSchedule = schedule?.available === true;
  const [showSchedule, setShowSchedule] = useState(false);

  // Se abre solo la primera vez por evento, y otra vez si el admin lo modifica
  // (la versión es una huella de su contenido).
  useEffect(() => {
    if (!hasSchedule) return;
    if (localStorage.getItem(scheduleSeenKey(selectedEventId)) === schedule.version) return;

    // Pequeño retraso para que no sea tan brusco al cargar
    const timer = setTimeout(() => setShowSchedule(true), 1000);
    return () => clearTimeout(timer);
  }, [hasSchedule, schedule, selectedEventId]);

  const handleCloseSchedule = () => {
    localStorage.setItem(scheduleSeenKey(selectedEventId), schedule.version);
    setShowSchedule(false);
  };

  const drawDone = selectedEvent?.drawDone === true;

  /**
   * ¿Puede entrar a una pantalla que requiere evento? Si el dato local dice
   * que no tiene, se consulta al servidor antes de avisar: el admin pudo
   * agregarlo mientras esta pantalla estaba abierta.
   */
  const ensureEvent = async () => {
    if (selectedEvent) return true;
    const events = await reloadEvents();
    if (events.length > 0) return true;
    dialog.alert(NO_EVENT_DIALOG);
    return false;
  };

  /** Ejecuta la acción de una tarjeta mostrando "Consultando..." y los errores en un diálogo. */
  const cardAction = (card, action) => async () => {
    setBusyCard(card);
    try {
      await action();
    } catch (err) {
      dialog.alert({ type: "error", message: getErrorMessage(err, "No pudimos completar la acción. Inténtalo de nuevo.") });
    } finally {
      setBusyCard(null);
    }
  };

  const openGifts = cardAction("gifts", async () => {
    if (await ensureEvent()) navigate("/user/gifts");
  });

  const openGroupGifts = cardAction("group", async () => {
    if (await ensureEvent()) navigate("/user/group-gifts");
  });

  /**
   * Antes del sorteo no tiene sentido entrar a "Mi amigo secreto": se avisa
   * aquí mismo. Se consulta al servidor (no al estado local) porque el admin
   * pudo sortear mientras esta pantalla estaba abierta.
   */
  const openSecretFriend = cardAction("secret", async () => {
    if (!(await ensureEvent())) return;

    const res = await api.get("/user/secret-friend");
    if (res.data.revealed) {
      await reloadEvents(); // el sorteo ocurrió mientras la pantalla estaba abierta
      navigate("/user/secret");
      return;
    }
    const goToGifts = await dialog.confirm({
      ...NOT_DRAWN_DIALOG,
      message: `El administrador todavía no realiza el sorteo de "${res.data.event.title}". Cuando lo haga, podrás descubrir a tu amigo secreto. Mientras tanto, registra tus opciones de regalo 🎁`,
      confirmLabel: "Registrar mis regalos",
      cancelLabel: "Entendido",
    });
    if (goToGifts) navigate("/user/gifts");
  });

  const busyCta = "Consultando...";
  // Con los eventos ya cargados y ninguno: las tarjetas lo anticipan.
  const noEventBadge = ready && !selectedEvent ? <Badge tone="gray">Sin evento</Badge> : null;

  return (
    <>
      {/* Modal del Cronograma */}
      <ScheduleModal
        isOpen={showSchedule && hasSchedule}
        onClose={handleCloseSchedule}
        activities={schedule?.activities}
      />

      <div className="flex flex-col gap-8 animate-fade-in">
        {/* SALUDO */}
        <section className="text-center sm:text-left flex flex-col gap-1.5">
          <h1 className="font-festive font-bold text-3xl sm:text-4xl md:text-5xl text-on-page drop-shadow-md tracking-tight">
            ¡Hola, {user.firstName}! <span aria-hidden="true">🎄✨</span>
          </h1>
          {selectedEvent && (
            <p className="font-festive font-medium text-lg sm:text-xl text-on-page-accent">
              <span aria-hidden="true">🎅</span> {selectedEvent.title}
            </p>
          )}
        </section>

        <CountdownHero event={selectedEvent} />

        {/* ACCESOS */}
        <section
          aria-label="Accesos"
          className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 ${hasSchedule ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
        >
          <ActionCard
            to={selectedEvent ? "/user/gifts" : undefined}
            onClick={selectedEvent ? undefined : openGifts}
            disabled={busyCard === "gifts"}
            icon="🎁"
            badge={noEventBadge ?? (gifts && <Badge tone="gold">{gifts.length}/{MAX_GIFTS_PER_PARTICIPANT}</Badge>)}
            title="Mis opciones de regalo"
            description={`Registra hasta ${MAX_GIFTS_PER_PARTICIPANT} opciones de lo que te gustaría recibir este año.`}
            cta={
              busyCard === "gifts" ? busyCta
                : gifts?.length ? <>Editar deseos <span aria-hidden="true">✏️</span></>
                : <>Agregar deseos <span aria-hidden="true">➕</span></>
            }
          />
          <ActionCard
            to={drawDone ? "/user/secret" : undefined}
            onClick={drawDone ? undefined : openSecretFriend}
            disabled={busyCard === "secret"}
            icon="✨"
            iconBg="bg-emerald-100"
            highlight
            badge={
              noEventBadge ?? (selectedEvent && (drawDone
                ? <Badge tone="green">¡Ya puedes verlo! 🎉</Badge>
                : <Badge tone="gold">En espera ⏳</Badge>))
            }
            title="Ver mi amigo secreto"
            description={drawDone ? "El sorteo ya se realizó: descubre a quién te tocó regalar." : "Cuando el administrador realice el sorteo podrás verlo aquí."}
            cta={
              busyCard === "secret" ? busyCta : <><span aria-hidden="true">👁️</span> {drawDone ? "Revelar amigo" : "Ver estado"}</>
            }
            ctaVariant={drawDone ? "primary" : "secondary"}
          />
          <ActionCard
            to={selectedEvent ? "/user/group-gifts" : undefined}
            onClick={selectedEvent ? undefined : openGroupGifts}
            disabled={busyCard === "group"}
            icon="📜"
            badge={noEventBadge ?? (selectedEvent?.participantsCount > 0 && <Badge tone="gold">{selectedEvent.participantsCount} participantes</Badge>)}
            title="Opciones de regalo del grupo"
            description="Mira las ideas de regalo de los demás integrantes para inspirarte."
            cta={busyCard === "group" ? busyCta : <>Ver sugerencias <span aria-hidden="true">→</span></>}
          />
          {hasSchedule && (
            <ActionCard
              onClick={() => setShowSchedule(true)}
              icon="🗓️"
              iconBg="bg-red-100"
              badge={<Badge tone="red">{schedule.activities.length} actividades</Badge>}
              title="Ver cronograma navideño"
              description="Actividades, horarios y premios para celebrar juntos."
              cta={<>Ver programa <span aria-hidden="true">📅</span></>}
            />
          )}
        </section>

        {SHOW_PRIZE_CAROUSEL && <PrizeCarousel />}

        {selectedEvent && (
          <DonationsCard donations={donationsData ?? []} myParticipantId={selectedEvent.participantId} />
        )}
      </div>
    </>
  );
}
