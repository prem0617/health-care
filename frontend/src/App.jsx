
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/LandingPage'
import FindDoctors from './pages/FindDoctors'
import PatientAuth from './pages/PatientAuth'
import AppointmentPage from './pages/AppointmentBooking'
import WalletPage from './pages/Wallet'
import UpcomingAppointments from './pages/UpcomingAppointments'

function App() {

  return (
    <>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/booking' element={<FindDoctors/>} />
          <Route path='/auth' element={<PatientAuth/>} />
          <Route path='/appointment/:id' element={<AppointmentPage/>} />
          <Route path='/wallet' element={<WalletPage/>} />
          <Route path='/appointments' element={<UpcomingAppointments/>} />
        </Routes>  
    </>
  )
}

export default App
