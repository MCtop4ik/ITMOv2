import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/tailwind.css'
import { attachSmoothAnchors } from './utils/scroll'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Attach smooth anchor behavior after hydration
attachSmoothAnchors()
