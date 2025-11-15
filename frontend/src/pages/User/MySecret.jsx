import { useEffect, useState } from "react";
import api from "../../api";
import Card from "../../components/Card";

export default function MySecret() {
  const [secret, setSecret] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get("/user/secret-friend");
      setSecret(res.data);
    } catch (err) {
      console.error(err);
      alert("Error consultando amigo secreto");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading)
    return (
      <div className="text-center py-10 text-lg animate-pulse">
        ⏳ Cargando...
      </div>
    );

  if (!secret || secret.revealed === false) {
    return (
      <div className="alert alert-warning shadow-md flex items-center gap-2 text-lg">
        🎅 A la espera del sorteo...
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
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

          <h3 className="mt-4 font-semibold text-green-700 text-lg">📋 Sus opciones de regalo</h3>

          {/* Lista de regalos */}
          <div className="space-y-2">
            {secret.gifts.map(g => (
              <div key={g.id} className="p-3 bg-base-200 rounded shadow hover:bg-base-300 transition">
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
