import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initGhostHaptics } from './utils/soundEffects'

// Initialize Ghost Cyber-Industrial Haptics Web Audio Engine
initGhostHaptics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
