import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initAudioHaptics } from './utils/soundEffects'

// Initialize Procedural Web Audio Engine
initAudioHaptics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
