import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import ClientLayout from './components/ClientLayout'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ClientLayout>
        < App />
      </ClientLayout>
    </BrowserRouter>
  </StrictMode>,
)
