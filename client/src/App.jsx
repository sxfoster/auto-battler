import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import MainMenu from './components/MainMenu.jsx'
import NewGame from './components/NewGame.jsx'
import LoadGame from './components/LoadGame.jsx'
import Settings from './components/Settings.jsx'
import PartySetupScreen from './components/PartySetupScreen.tsx'; // Import the new screen
import DungeonPage from './components/DungeonPage.tsx';
import MagicalPouch from './components/MagicalPouch.tsx';
import InventoryScreen from './components/InventoryScreen.tsx'
import CardCollection from './components/CardCollection.tsx'
import CombatPage from './components/CombatPage.tsx'

const demoProfession = { name: 'Cooking', level: 1, experience: 0, unlockedRecipes: [], professionOnlyCards: [] };
const demoPlayer = { id: '1', name: 'Hero', professions: { Cooking: demoProfession }, discoveredRecipes: [] };

function App() {
  const location = useLocation()

  return (
    <SwitchTransition>
      <CSSTransition
        key={location.pathname}
        classNames="slide"
        timeout={300}
        unmountOnExit
      >
        <Routes location={location}>
          <Route path="/" element={<MainMenu />} />
          <Route path="/new-game" element={<NewGame />} />
          <Route path="/party-setup" element={<PartySetupScreen />} /> {/* Add this route */}
          <Route path="/load-game" element={<LoadGame />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dungeon" element={<DungeonPage />} />
          <Route path="/pouch" element={<MagicalPouch player={demoPlayer} profession={demoProfession} />} />
          <Route path="/inventory" element={<InventoryScreen />} />
          <Route path="/cards" element={<CardCollection />} />
          <Route path="/battle" element={<CombatPage />} />
        </Routes>
      </CSSTransition>
    </SwitchTransition>
  )
}

export default App
