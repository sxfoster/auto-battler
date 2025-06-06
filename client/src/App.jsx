import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import MainMenu from './components/MainMenu.jsx'
import PartySetup from './components/PartySetup.tsx'
import DungeonMap from './components/DungeonMap.tsx'
import TownView from './components/TownView.tsx'
import InventoryPage from './components/InventoryPage.tsx'
import CollectionPage from './components/CollectionPage.tsx'
import CraftingPage from './components/CraftingPage.tsx'
import ShopPage from './components/ShopPage.tsx'
import DeckManager from './components/DeckManager.jsx'

function AnimatedRoutes() {
  const location = useLocation()
  const previousPath = useRef(location.pathname)

  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      window.location.reload()
    }
    previousPath.current = location.pathname
  }, [location.pathname])

  return (
    <SwitchTransition>
      <CSSTransition
        key={location.pathname}
        classNames="fade"
        timeout={300}
        unmountOnExit
      >
        <Routes location={location}>
          <Route path="/" element={<MainMenu />} />
          <Route path="/party-setup" element={<PartySetup />} />
          <Route path="/dungeon" element={<DungeonMap />} />
          <Route path="/town" element={<TownView />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/cards" element={<CollectionPage />} />
          <Route path="/crafting" element={<CraftingPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/decks" element={<DeckManager />} />
        </Routes>
      </CSSTransition>
    </SwitchTransition>
  )
}

function App() {
  return <AnimatedRoutes />
}

export default App
