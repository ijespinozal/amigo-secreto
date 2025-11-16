import { useEffect, useState } from "react";
import api from "../../api";
import Card from "../../components/Card";
import Spinner from "../../components/Spinner";
import AlertMessage from "../../components/AlertMessage";

export default function MySecret() {
  const [secret, setSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const load = async () => {
    try {
      const res = await api.get("/user/secret-friend");
      setSecret(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // 🌟 LOADING CENTRAL CON SPINNER
  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="lg" />
      </div>
    );

  // 🌟 ALERTA SI AÚN NO HAY SORTEO
  if (!secret || secret.revealed === false) {
    return (
      <div className="relative">
        {alert.show && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ show: false })}
          />
        )}

        <div className="alert alert-warning shadow-md flex items-center gap-2 text-lg mt-4">
          🎅 A la espera del sorteo...
        </div>
      </div>
    );
  }

  // 🌟 SI HAY AMIGO SECRETO MOSTRARLO
  return (
    <div className="animate-fadeIn relative">

      {/* ALERTA */}
      {alert.show && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ show: false })}
        />
      )}

      <Card title="🎁 Tu amigo secreto">
        <div className="space-y-3">

          {/* Datos del amigo secreto */}
          <div className="bg-base-200 p-4 rounded shadow-inner">
            <p className="font-bold text-xl">
              {secret.friend.firstName} {secret.friend.lastName}
            </p>
            <p className="text-sm opacity-80">
              {secret.friend.phone}
              {secret.friend.email && ` • ${secret.friend.email}`}
            </p>
          </div>

          <h3 className="mt-4 font-semibold text-green-700 text-lg">
            📋 Sus opciones de regalo
          </h3>

          {/* Lista de regalos */}
          <div className="space-y-2">
            {secret.gifts.map(g => (
              <div 
                key={g.id} 
                className="p-3 bg-base-200 rounded shadow hover:bg-base-300 transition"
              >
                <strong className="block text-lg">{g.title}</strong>
                <p className="text-sm">{g.note}</p>

                {g.link && (
                  <a 
                    href={g.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-primary text-sm underline"
                  >
                    Ver link
                  </a>
                )}
              </div>
            ))}
          </div>

        </div>
      </Card>
    </div>
  );
}
