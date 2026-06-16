import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { RecipeDraftProvider } from './context/RecipeDraftContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RecipeDraftProvider>
        <App />
      </RecipeDraftProvider>
    </AuthProvider>
  </StrictMode>,
)
