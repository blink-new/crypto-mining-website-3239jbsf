import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from './components/ui/sonner'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster />
    <App />
  </React.StrictMode>,
) 