import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import MainMenu from './components/MainMenu.jsx'
import PartySetup from './components/PartySetup.tsx'
import DungeonMap from './components/DungeonMap.tsx'
import TownView from './components/TownView.tsx'

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
        </Routes>
      </CSSTransition>
    </SwitchTransition>
  )
}

function App() {
  return <AnimatedRoutes />
}

export default App
