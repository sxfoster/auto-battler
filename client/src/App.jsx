import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import MainMenu from './components/MainMenu.jsx'
import NewGame from './components/NewGame.jsx'
import LoadGame from './components/LoadGame.jsx'
import Settings from './components/Settings.jsx'

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
          <Route path="/load-game" element={<LoadGame />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </CSSTransition>
    </SwitchTransition>
  )
}

export default App
