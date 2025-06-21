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

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<FindDoctors />} />
        <Route path="/auth" element={<PatientAuth />} />
        <Route path="/appointment/:id" element={<AppointmentPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/appointments" element={<UpcomingAppointments />} />

        {/* DOCTOR ROUTES */}
        <Route path="/doctor/auth" element={<DoctorAuth />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/transactions" element={<Transactions />} />
        <Route path="/doctor/chatVerification" element={<ChatVerification />} />
      </Routes>
    </>
  );
}

export default App;
