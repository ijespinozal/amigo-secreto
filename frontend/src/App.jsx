import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./routes/PrivateRoute";

/* Auth */
import Login from "./pages/Login";
import Register from "./pages/Register";

/* Admin */
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ParticipantsPage from "./pages/Admin/ParticipantsPage";

/* User */
import UserDashboard from "./pages/User/UserDashboard";
import MyGiftForm from "./pages/User/MyGiftForm";
import MySecret from "./pages/User/MySecret";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* MAIN crece automáticamente hasta empujar el footer al final */}
      <main className="flex-grow container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          {/* fallback */}
          <Route path="*" element={<Login />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

