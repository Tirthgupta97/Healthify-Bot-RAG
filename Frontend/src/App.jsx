import { BrowserRouter as Router, Route, Routes, useLocation, Navigate, useNavigate } from "react-router-dom";
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
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { Loader2 } from "lucide-react"; // You're already using lucide-react elsewhere

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

// Protected route component with improved feedback
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      // Verify token validity
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("authToken");
        navigate("/login?error=session_expired");
      }
    } catch (error) {
      localStorage.removeItem("authToken");
      navigate("/login?error=invalid_token");
    } finally {
      setIsValidating(false);
    }
  }, [token, navigate]);
  
  if (isValidating) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-indigo-600" />
          <p className="mt-2 text-gray-600">Validating your session...</p>
        </div>
      </div>
    );
  }
  
  return token ? children : null;
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>  
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chatbot" element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          } />
          <Route path="/games" element={
            <ProtectedRoute>
              <Games />
            </ProtectedRoute>
          } />
          <Route path="/Memory-Match" element={
            <ProtectedRoute>
              <MemoryMatch />
            </ProtectedRoute>
          } />
          <Route path="/Breathing" element={
            <ProtectedRoute>
              <MindfulBreathing />
            </ProtectedRoute>
          } />
          <Route path="/Sound-board" element={
            <ProtectedRoute>
              <SoothingSoundboard />
            </ProtectedRoute>
          } />
          <Route path="/Calm-Coloring" element={
            <ProtectedRoute>
              <CalmColoring />
            </ProtectedRoute>
          } />
          <Route path="/Hang-Man" element={
            <ProtectedRoute>
              <HangmanGame />
            </ProtectedRoute>
          } />
          <Route path="/2048" element={
            <ProtectedRoute>
              <Game2048 />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;


