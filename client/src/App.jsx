import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainMenu from './components/MainMenu.jsx'
import PartySetup from './components/PartySetup.tsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/party-setup" element={<PartySetup />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
