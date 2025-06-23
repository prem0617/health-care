import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/LandingPage";
import FindDoctors from "./pages/FindDoctors";
import PatientAuth from "./pages/PatientAuth";
import AppointmentPage from "./pages/AppointmentBooking";
import WalletPage from "./pages/Wallet";
import UpcomingAppointments from "./pages/UpcomingAppointments";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorAuth from "./pages/Doctor/DoctorAuth";
import Transactions from "./pages/Doctor/DoctorTransaction";
import ChatVerification from "./pages/Doctor/ChatVerification";
import ChatPage from "./pages/ChatPage";
import UsersChat from "./pages/Doctor/UsersChat";

import { useSocket } from "./hooks/useSocket";
import useUser from "./hooks/useUser";

function App() {
  // ✅ Call hooks directly in component body
  const { user, loading, error } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Optional: Show error state
  if (error) {
    console.error("User error:", error);
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<FindDoctors />} />
        <Route path="/auth" element={<PatientAuth />} />
        <Route path="/appointment/:id" element={<AppointmentPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/appointments" element={<UpcomingAppointments />} />

        {/* DOCTOR ROUTES */}
        <Route path="/doctor/auth" element={<DoctorAuth />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/transactions" element={<Transactions />} />
        <Route path="/doctor/chatVerification" element={<ChatVerification />} />
        <Route path="doctor/chat" element={<UsersChat />} />
      </Routes>
    </>
  );
}

export default App;
