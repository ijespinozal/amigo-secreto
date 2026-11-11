import { Navigate, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GuestRoute from "./routes/GuestRoute";
import PrivateRoute from "./routes/PrivateRoute";
import EventSelector from "./components/EventSelector";
import FestiveBackground from "./components/layout/FestiveBackground";
import FloatingControls from "./components/layout/FloatingControls";

/* Auth */
import Login from "./pages/Login";
import Register from "./pages/Register";

/* Admin */
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ParticipantsPage from "./pages/Admin/ParticipantsPage";
import SchedulePage from "./pages/Admin/SchedulePage";

/* User */
import UserDashboard from "./pages/User/UserDashboard";
import MyGiftForm from "./pages/User/MyGiftForm";
import MySecret from "./pages/User/MySecret";
import GroupGifts from "./pages/User/GroupGifts";
import SecretChat from "./pages/User/SecretChat";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <FestiveBackground />
      <Header />

      {/* MAIN crece automáticamente hasta empujar el footer al final */}
      {/* Sin z-index propio: así los modales (fixed, z-50) quedan por encima del header. */}
      <main className="relative flex-grow w-full max-w-[1100px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {/* Solo visible para usuarios que participan en más de un evento */}
        <EventSelector />

        <Routes>
          {/* Solo invitados: con sesión iniciada redirigen al inicio del rol */}
          <Route path="/" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute adminOnly>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/event/:id/participants" element={
            <PrivateRoute adminOnly>
              <ParticipantsPage />
            </PrivateRoute>
          } />
          <Route path="/admin/event/:id/schedule" element={
            <PrivateRoute adminOnly>
              <SchedulePage />
            </PrivateRoute>
          } />

          {/* User */}
          <Route path="/user/home" element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          } />
          <Route path="/user/gifts" element={
            <PrivateRoute>
              <MyGiftForm />
            </PrivateRoute>
          } />
          <Route path="/user/secret" element={
            <PrivateRoute>
              <MySecret />
            </PrivateRoute>
          } />
          <Route path="/user/group-gifts" element={
            <PrivateRoute>
              <GroupGifts />
            </PrivateRoute>
          } />
          <Route path="/user/chat" element={
            <PrivateRoute>
              <SecretChat />
            </PrivateRoute>
          } />

          {/* Cualquier otra dirección (p. ej. /login): al inicio, que decide según la sesión */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <FloatingControls />
    </div>
  );
}

