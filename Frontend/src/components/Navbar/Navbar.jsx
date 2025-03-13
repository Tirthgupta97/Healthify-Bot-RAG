import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItemVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    },
    hover: { 
      scale: 1.05,
      transition: { 
        type: "spring", 
        stiffness: 400 
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      backdropFilter: "blur(0px)",
      backgroundColor: "rgba(0,0,0,0)"
    },
    visible: {
      opacity: 1,
      height: "auto",
      backdropFilter: "blur(20px)",
      backgroundColor: "rgba(17,24,39,0.8)",
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      backdropFilter: "blur(0px)",
      backgroundColor: "rgba(0,0,0,0)",
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 100,
        damping: 15
      }}
      className="bg-gradient-to-r from-[#1a2980] via-[#26d0ce] to-[#1a2980] text-white py-4 px-6 flex justify-between items-center shadow-2xl backdrop-blur-md fixed w-full top-0 z-50 border-b border-white/10"
    >
      {/* Futuristic Logo with Enhanced Animation */}
      <motion.h1 
        whileHover={{ 
          scale: 1.05, 
          textShadow: "0 0 15px rgba(38,208,206,0.7)" 
        }}
        whileTap={{ scale: 0.95 }}
        className="text-4xl font-bold tracking-widest cursor-pointer"
      >
        <motion.span 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: 0.2, 
            type: "spring", 
            stiffness: 200 
          }}
          className="bg-gradient-to-r from-[#26d0ce] to-[#1a2980] bg-clip-text text-transparent"
        >
          Health
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: 0.4, 
            type: "spring", 
            stiffness: 200 
          }}
          className="bg-gradient-to-r from-[#1a2980] to-[#26d0ce] bg-clip-text text-transparent"
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
            variants={navItemVariants}
            whileHover="hover"
            className="relative"
          >
            <NavLink
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-xl transition-all duration-300 ease-in-out overflow-hidden ${
                  isActive 
                    ? "text-[#26d0ce] bg-white/10 shadow-lg" 
                    : "text-white hover:text-[#26d0ce]"
                }`
              }
            >
              <span className="relative z-10">{item}</span>
              <motion.div
                className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#26d0ce] to-[#1a2980] rounded-full"
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
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9, rotate: -5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-white focus:outline-none bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-colors"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "close" : "open"}
            initial={{ rotate: 0, opacity: 0.7 }}
            animate={{ rotate: isOpen ? 180 : 0, opacity: 1 }}
            exit={{ rotate: 0, opacity: 0.7 }}
            transition={{ 
              duration: 0.4, 
              type: "spring", 
              stiffness: 250 
            }}
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
            className="absolute top-16 left-0 w-full bg-gradient-to-b from-[#1a2980] to-[#26d0ce] shadow-2xl flex flex-col items-center space-y-4 py-6 text-lg font-medium md:hidden z-50 backdrop-blur-xl border-b border-white/10"
          >
            {["Home", "Chatbot", "Games"].map((item, index) => (
              <motion.div
                key={item}
                variants={navItemVariants}
                whileHover="hover"
                className="w-4/5"
              >
                <NavLink
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block text-center py-3 px-6 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? "bg-white/20 text-[#26d0ce]" 
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
