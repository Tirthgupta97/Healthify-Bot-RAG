import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-800 text-white py-4 px-6 flex justify-between items-center shadow-2xl backdrop-blur-md fixed w-full top-0 z-50 border-b border-white/10"
    >
      {/* Logo with enhanced animation */}
      <motion.h1 
        whileHover={{ scale: 1.05, textShadow: "0 0 8px rgba(255,255,255,0.5)" }}
        whileTap={{ scale: 0.95 }}
        className="text-3xl font-extrabold tracking-wider cursor-pointer"
      >
        <motion.span 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="bg-gradient-to-r from-yellow-300 to-yellow-200 bg-clip-text text-transparent"
        >
          Health
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="bg-gradient-to-r from-yellow-200 to-yellow-100 bg-clip-text text-transparent"
        >
          ify
        </motion.span>
      </motion.h1>

      {/* Enhanced Desktop Links */}
      <motion.div 
        className="hidden md:flex space-x-8 text-lg font-medium"
        variants={navItemVariants}
        initial="hidden"
        animate="visible"
      >
        {["Home", "Chatbot", "Games"].map((item, index) => (
          <motion.div
            key={item}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 300
            }}
          >
            <NavLink
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className={({ isActive }) =>
                `relative px-3 py-2 rounded-lg transition-all duration-300 ease-in-out ${
                  isActive 
                    ? "text-yellow-300 bg-white/10 shadow-lg" 
                    : "text-white hover:bg-white/5"
                }`
              }
            >
              <span className="relative z-10">{item}</span>
              <motion.div
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-300 to-yellow-200 rounded-full"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </NavLink>
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-white focus:outline-none bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "close" : "open"}
            initial={{ rotate: 0 }}
            animate={{ rotate: isOpen ? 180 : 0 }}
            exit={{ rotate: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-16 left-0 w-full bg-gradient-to-b from-blue-800 to-purple-900 shadow-2xl flex flex-col items-center space-y-4 py-6 text-lg font-medium md:hidden z-50 backdrop-blur-md border-b border-white/10"
          >
            {["Home", "Chatbot", "Games"].map((item, index) => (
              <motion.div
                key={item}
                variants={navItemVariants}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-4/5"
              >
                <NavLink
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block text-center py-3 px-6 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? "bg-white/20 text-yellow-300" 
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  {item}
                </NavLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
