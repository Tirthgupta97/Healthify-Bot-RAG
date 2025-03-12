import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Import icons

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // State to control menu toggle

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-4 px-6 flex justify-between items-center shadow-lg">
      {/* Logo */}
      <h1 className="text-3xl font-extrabold tracking-wide cursor-pointer transition-transform duration-300 hover:scale-105">
        <span className="text-yellow-300">Health</span>ify
      </h1>

      {/* Desktop Links */}
      <div className="hidden md:flex space-x-8 text-lg font-medium">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `transition-all duration-300 ease-in-out ${
              isActive ? "text-yellow-300" : "text-white"
            } hover:text-yellow-300`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/chatbot"
          className={({ isActive }) =>
            `transition-all duration-300 ease-in-out ${
              isActive ? "text-yellow-300" : "text-white"
            } hover:text-yellow-300`
          }
        >
          Chatbot
        </NavLink>
        <NavLink
          to="/games"
          className={({ isActive }) =>
            `transition-all duration-300 ease-in-out ${
              isActive ? "text-yellow-300" : "text-white"
            } hover:text-yellow-300`
          }
        >
          Games
        </NavLink>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-white focus:outline-none transition-transform duration-300"
      >
        {isOpen ? <X size={30} /> : <Menu size={30} />}
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-blue-800 shadow-lg flex flex-col items-center space-y-4 py-4 text-lg font-medium md:hidden z-50">
          <NavLink
            to="/"
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-yellow-300 transition-all duration-300"
          >
            Home
          </NavLink>
          <NavLink
            to="/chatbot"
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-yellow-300 transition-all duration-300"
          >
            Chatbot
          </NavLink>
          <NavLink
            to="/games"
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-yellow-300 transition-all duration-300"
          >
            Games
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
