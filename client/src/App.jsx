import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import MainMenu from './components/MainMenu.jsx'
import PartySetup from './components/PartySetup.tsx'
import PreBattleSetup from './components/PreBattleSetup.tsx'
import DungeonMap from './components/DungeonMap.tsx'
import Event from './routes/Event.jsx'
import TownView from './components/TownView.tsx'
import InventoryPage from './components/InventoryPage.tsx'
import CollectionPage from './components/CollectionPage.tsx'
import CraftingPage from './components/CraftingPage.tsx'
import Shop from './routes/Shop.jsx'
import DeckManager from './components/DeckManager.jsx'
import BattleScene from './components/BattleScene.tsx'

export default function App() {
  const loc = useLocation()
  return (
    <TransitionGroup>
      <CSSTransition key={loc.pathname} classNames="page" timeout={300}>
        <Routes location={loc}>
          <Route path="/" element={<MainMenu />} />
          <Route path="/party-setup" element={<PartySetup />} />
          <Route path="/dungeon" element={<DungeonMap />} />
          <Route path="/town" element={<TownView />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/cards" element={<CollectionPage />} />
          <Route path="/crafting" element={<CraftingPage />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/pre-battle" element={<PreBattleSetup />} />
          <Route path="/battle" element={<BattleScene />} />
          <Route path="/event" element={<Event />} />
          <Route path="/decks" element={<DeckManager />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  )
}
