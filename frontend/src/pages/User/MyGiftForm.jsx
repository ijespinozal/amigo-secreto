import GiftForm from "../../components/GiftForm";
import { useState, useEffect } from "react";
import api from "../../api";
import Card from "../../components/Card";

export default function MyGiftForm() {
  const [gifts, setGifts] = useState([]);

  const load = async () => {
    try {
      const res = await api.get("/user/gifts");
      setGifts(res.data);
    } catch (err) {
      console.warn("No hay endpoint GET /user/gifts");
    }
  };

  const removeGift = async (id) => {
    const confirmDelete = window.confirm("¿Seguro que deseas eliminar esta opción?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/user/gift/${id}`);
      await load();
    } catch (err) {
      console.error(err);
      alert("Error eliminando opción");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-white text-center md:text-left flex items-center gap-2">
        🎄 Mis opciones de regalo
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* FORM */}
        <Card title="Agregar nueva opción">
          <GiftForm onAdded={load} />
        </Card>

        {/* LISTA */}
        <Card title="Tus opciones registradas">
          {gifts.length === 0 ? (
            <p className="text-sm opacity-70">Aún no agregaste opciones.</p>
          ) : (
            <div className="space-y-3">
              {gifts.map(g => (
                <div
                  key={g.id}
                  className="p-3 rounded bg-base-200 shadow-sm hover:bg-base-300 transition flex justify-between items-start"
                >

                  {/* INFO */}
                  <div className="flex-1 pr-4">
                    <div className="font-semibold text-lg">{g.title}</div>
                    <p className="text-sm">{g.note}</p>

                    {g.donation && (
                      <p className="text-xs opacity-70 mt-1">🎁 {g.donation}</p>
                    )}

                    {g.link && (
                      <a
                        href={g.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-sm underline block mt-1"
                      >
                        Ver link del regalo
                      </a>
                    )}
                  </div>

                  {/* BOTÓN ELIMINAR */}
                  <button
                    onClick={() => removeGift(g.id)}
                    className="h-10 w-[20%] max-w-[60px] flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition"
                    title="Eliminar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white hover:text-red-700 transition"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 
                        01.117-.993L9 5h6a1 1 0 011 1v1M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
