import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Chatbot from "./pages/Chatbot";
import Home from "./pages/Home";
import Games from "./pages/Games";
import Footer from "./components/Footer/Footer";
import MemoryMatch from "./pages/MemoryMatch";
import MindfulBreathing from "./pages/MindfulBreathing";
import SoothingSoundboard from "./pages/SoothingSoundboard";
import CalmColoring from "./pages/CalmColoring";
import HangmanGame from "./pages/HangmanGame";
import Game2048 from "./pages/Game2048";
import IntelligentAI from './pages/features/IntelligentAI';
import StressFreeActivities from './pages/features/StressFreeActivities';
import GlobalSupport from './pages/features/GlobalSupport';
import MoodTracking from './pages/features/MoodTracking';

const Layout = ({ children }) => {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/Memory-Match" || location.pathname === "/Breathing" || location.pathname === "/Sound-board" || location.pathname === "/Calm-Coloring" || location.pathname === "/Hang-Man" || location.pathname === "/2048";

  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeaderFooter && <Navbar />}
      <div className="flex-grow">{children}</div>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>  
          <Route path="/" element={<Home />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/games" element={<Games />} />
          <Route path="/Memory-Match" element={<MemoryMatch />} />
          <Route path="/Breathing" element={<MindfulBreathing />} />
          <Route path="/Sound-board" element={<SoothingSoundboard />} />
          <Route path="/Calm-Coloring" element={<CalmColoring />} />
          <Route path="/Hang-Man" element={<HangmanGame />} />
          <Route path="/2048" element={<Game2048 />} />
          <Route path="/features/intelligent-ai" element={<IntelligentAI />} />
          <Route path="/features/stress-free-activities" element={<StressFreeActivities />} />
          <Route path="/features/global-support" element={<GlobalSupport />} />
          <Route path="/features/mood-tracking" element={<MoodTracking />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;


