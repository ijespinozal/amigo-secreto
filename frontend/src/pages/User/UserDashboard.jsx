import { Link } from "react-router-dom";
import Card from "../../components/Card";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import api from "../../api";
import TimelineModal from "../../components/TimelineModal";

export default function UserDashboard() {
  const { user } = useAuth();
  const [daysLeft, setDaysLeft] = useState(0);
  const [daysCalendar, setDaysCalendar] = useState(0);
  const [donations, setDonations] = useState([]);
  const [eventId, setEventId] = useState(99);
  const [showTimeline, setShowTimeline] = useState(false);

  // Lógica para mostrar el modal SOLO la primera vez
  useEffect(() => {
    const hasSeenTimeline = localStorage.getItem('hasSeenChristmasTimeline');
    
    // Si NO existe la marca en localStorage, mostramos el modal
    if (!hasSeenTimeline) {
      // Pequeño timeout para que no sea tan brusco al cargar
      const timer = setTimeout(() => {
        setShowTimeline(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseTimeline = () => {
    // Al cerrar, guardamos la marca en localStorage
    localStorage.setItem('hasSeenChristmasTimeline', 'true');
    setShowTimeline(false);
  };

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await api.get(`/user/donations`);
        setDonations(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDonations();
  }, []);

  useEffect(() => {
    const fetchEventInfo = async () => {
      const res = await api.get("/user/event-info");
      setEventId(res.data.eventId);
    };

    fetchEventInfo();
  }, []);

  useEffect(() => {
    if (!eventId) return;

    let eventDate,
        calendayDay

    if (eventId === 1) {
      eventDate = new Date("2025-12-07");
      calendayDay = 7
    } else if (eventId === 3) {
      eventDate = new Date("2025-12-20");
      calendayDay = 20
    } else {
      eventDate = new Date("2025-12-25");
      calendayDay = 25
    }

    const today = new Date();
    const diff = eventDate - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    setDaysLeft(days);
    setDaysCalendar(calendayDay)
  }, [eventId]);


  // useEffect(() => {
  //   const eventDate = new Date("2025-12-07");
  //   const today = new Date();

  //   const diff = eventDate - today;
  //   const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  //   setDaysLeft(days);
  // }, []);

  return (
    <>
      {/* Modal del Cronograma */}
      <TimelineModal 
        isOpen={showTimeline} 
        onClose={handleCloseTimeline} 
      />
      <div className="space-y-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          🎅 Bienvenid@ {user.firstName}
        </h1>

        {/* ⭐ Banner Navideño Horizontal ⭐ */}
        <div className="christmas-banner-container">
          <div className="christmas-banner-track">
            <div className="christmas-banner">
              🎄 Falta(n) <strong>{daysLeft}</strong> día(s) para nuestra reunión navideña — 📅 <strong>{daysCalendar}</strong> de diciembre 🎁✨. Ve agregando tus opciones de regalo.🏃🏽
            </div>

            {/* DUPLICADO — requerido para scroll infinito */}
            <div className="christmas-banner">
              🎄 Falta(n) <strong>{daysLeft}</strong> día(s) para nuestra reunión navideña — 📅 <strong>{daysCalendar}</strong> de diciembre 🎁✨. Ve agregando tus opciones de regalo.🏃🏽
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Link to="/user/gifts" className="group">
            <Card className="p-6 hover:shadow-xl hover:bg-base-200 transition">
              <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2">
                🎁 Mis opciones de regalo
              </h3>
              <p className="opacity-80 mt-2">
                Agrega hasta 3 opciones para que tu amigo secreto te conozca.
              </p>
            </Card>
          </Link>

          <Link to="/user/secret" className="group">
            <Card className="p-6 hover:shadow-xl hover:bg-base-200 transition">
              <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2">
                🎄 Ver mi amigo secreto
              </h3>
              <p className="opacity-80 mt-2">
                Cuando el administrador realice el sorteo podrás verlo aquí.
              </p>
            </Card>
          </Link>

          <div className="mt-6 p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/25 shadow-2xl animate-fadeInUp text-white relative overflow-hidden col-span-1 md:col-span-2">

            {/* ⭐ Encabezado con estilo navideño */}
            <h3 className="text-2xl font-extrabold mb-5 text-center flex items-center gap-3 tracking-wide">
              <span className="text-[#ffdf80] text-xl animate-bounce ">🎄</span>
              Donaciones del Evento
              <span className="text-[#ffdf80] text-xl animate-bounce ">✨</span>
            </h3>

            {/* Input personalizado */}
            {/* <label className="block mb-4 font-medium text-white/90">
              <span className="mr-2">🎫 Event ID:</span>
              <input
                type="number"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="px-3 py-2 bg-white/90 text-black rounded-lg outline-none shadow-inner w-28 focus:ring-2 focus:ring-green-500"
              />
            </label> */}

            {/* Tabla o mensaje */}
            {donations.length === 0 ? (
              <p className="opacity-90 italic">🎅 No hay donaciones para este evento aún.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/40 shadow-lg backdrop-blur-sm bg-white/10">
                <table className="table w-full text-white">
                  <thead className="bg-white/20">
                    <tr>
                      <th className="text-white py-3">👤 Participante</th>
                      <th className="text-white py-3">💰 Donación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d, i) => {
                      const fullName = `${d.firstName} ${d.lastName}`;
                      const prevFullName =
                        i > 0 ? `${donations[i - 1].firstName} ${donations[i - 1].lastName}` : null;

                      const showName = fullName !== prevFullName;

                      return (
                        <tr key={i} className="hover:bg-white/10 transition">
                          <td className="py-3 px-3 text-center">
                            {showName ? fullName : ""}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {d.donation}
                          </td>
                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>
            )}

          </div>



        </div>
      </div>
    </>
  );
}
