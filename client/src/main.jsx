import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { useGameStore } from './store/gameStore'
import { GameStateProvider } from './GameStateProvider.jsx'
import { ModalProvider } from './components/ModalManager.jsx'
import { NotificationProvider } from './components/NotificationManager.jsx'
import { loadInventory } from 'shared/inventoryState'
import { loadDungeon } from 'shared/dungeonState'

// Load persisted inventory before rendering
loadInventory()
// Load persisted dungeon (so we resume in the right room)
loadDungeon()

// Load any saved state before the app renders
useGameStore.getState().load()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameStateProvider>
      <BrowserRouter>
        <ModalProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </ModalProvider>
      </BrowserRouter>
    </GameStateProvider>
  </StrictMode>,
)
