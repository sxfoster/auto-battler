import './App.css'
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import MainMenu from './components/MainMenu.jsx'
import PartySetup from './components/PartySetup.tsx'
import DungeonMap from './components/DungeonMap.tsx'

function AnimatedRoutes() {
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
          <Route path="/party-setup" element={<PartySetup />} />
          <Route path="/dungeon" element={<DungeonMap />} />
        </Routes>
      </CSSTransition>
    </SwitchTransition>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
