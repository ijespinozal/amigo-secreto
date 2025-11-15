import { Link } from "react-router-dom";
import Card from "../../components/Card";

export default function UserDashboard() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-white flex items-center gap-2">
        🎅 Bienvenido
      </h1>

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

      </div>
    </div>
  );
}
