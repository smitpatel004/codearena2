import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1c1814',
                color: '#e8dfd0',
                border: '1px solid rgba(184,150,44,0.15)',
                borderRadius: '6px',
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#b8962c', secondary: '#100e0c' } },
              error: { iconTheme: { primary: '#a83030', secondary: '#fff' } },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
