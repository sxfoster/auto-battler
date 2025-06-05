import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import MainMenu from './components/MainMenu.jsx'
import NewGame from './components/NewGame.jsx'
import LoadGame from './components/LoadGame.jsx'
import Settings from './components/Settings.jsx'
import PartySetupScreen from './components/PartySetupScreen.tsx'; // Import the new screen
import DungeonPage from './components/DungeonPage.tsx';

function App() {
  const location = useLocation()

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
          <Route path="/new-game" element={<NewGame />} />
          <Route path="/party-setup" element={<PartySetupScreen />} /> {/* Add this route */}
          <Route path="/load-game" element={<LoadGame />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dungeon" element={<DungeonPage />} />
        </Routes>
      </CSSTransition>
    </SwitchTransition>
  )
}

export default App
