import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import MainMenu from "./components/MainMenu.jsx";
import PartySetup from "./components/PartySetup.tsx";
import PreBattleSetup from "./components/PreBattleSetup.tsx";
import DungeonMap from "./components/DungeonMap.tsx";
import Event from "./routes/Event.jsx";
import TownHub from "./components/TownHub.tsx";
import InventoryPage from "./components/InventoryPage.tsx";
import CollectionPage from "./components/CollectionPage.tsx";
import CraftingPage from "./components/CraftingPage.tsx";
import Shop from "./routes/Shop.jsx";
import DeckManager from "./components/DeckManager.jsx";
import ReplayBattle from "./routes/ReplayBattle";
import BattleViewer from "./components/BattleViewer.tsx";
import { sampleSteps } from "./sampleBattleSteps";

export default function App() {
  const location = useLocation();
  const steps = (location.state && (location.state as any).steps) || sampleSteps;
  return (
    <Routes key={location.pathname} location={location}>
      <Route path="/" element={<MainMenu />} />
      <Route path="/party-setup" element={<PartySetup />} />
      <Route path="/dungeon" element={<DungeonMap />} />
      <Route path="/town" element={<TownHub />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/cards" element={<CollectionPage />} />
      <Route path="/crafting" element={<CraftingPage />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/pre-battle" element={<PreBattleSetup />} />
      <Route path="/battle" element={<ReplayBattle />} />
      <Route path="/battle-replay" element={<ReplayBattle />} />
      <Route path="/battle-sim" element={<ReplayBattle />} />
      <Route path="/viewer" element={<BattleViewer steps={steps} />} />
      <Route path="/event" element={<Event />} />
      <Route path="/decks" element={<DeckManager />} />
    </Routes>
  );
}
