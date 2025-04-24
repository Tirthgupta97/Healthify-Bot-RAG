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
      scale: 1.08,
      textShadow: "0px 0px 15px rgba(0, 255, 255, 0.9)",
      transition: { 
        type: "spring", 
        stiffness: 450,
        damping: 8
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      backgroundColor: "rgba(10, 25, 47, 0.98)",
      boxShadow: "0px 4px 20px rgba(0, 198, 255, 0.3)",
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
        delayChildren: 0.15
      }
    },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
      className="bg-gradient-to-r from-[#0a1930] via-[#162d45] to-[#1e4159] text-white py-5 px-7 flex justify-between items-center shadow-[0_5px_25px_rgba(0,198,255,0.25)] backdrop-blur-md fixed w-full top-0 z-50 border-b border-[#00c6ff]/30"
    >
      {/* Logo with Neon Effect */}
      <motion.h1 
        whileHover={{ scale: 1.05, textShadow: "0 0 25px rgba(0, 255, 255, 0.8)" }}
        whileTap={{ scale: 0.95 }}
        className="text-4xl font-bold tracking-wider cursor-pointer relative"
      >
        <motion.span 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="bg-gradient-to-r from-[#00e6ff] to-[#0072ff] bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(0,198,255,0.5)]"
        >
          Health
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="bg-gradient-to-r from-[#0072ff] to-[#00e6ff] bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(0,198,255,0.5)]"
        >
          ify
        </motion.span>
        <motion.div
          className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00c6ff] to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        />
      </motion.h1>

      {/* Desktop Links */}
      <motion.div 
        className="hidden md:flex space-x-9 text-lg font-medium"
        variants={navItemVariants}
        initial="hidden"
        animate="visible"
      >
        {["Home", "Chatbot", "Games"].map((item) => (
          <motion.div key={item} variants={navItemVariants} whileHover="hover">
            <NavLink
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className={({ isActive }) =>
                `relative px-5 py-2 rounded-xl transition-all duration-300 ease-in-out overflow-hidden ${
                  isActive 
                    ? "text-[#00e6ff] bg-white/15 shadow-[0_0_15px_rgba(0,198,255,0.3)]" 
                    : "text-white hover:text-[#00e6ff]"
                }`
              }
            >
              <span className="relative z-10">{item}</span>
              <motion.div
                className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00c6ff] to-[#0072ff] rounded-full"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </NavLink>
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9, rotate: -5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-white focus:outline-none bg-gradient-to-r from-[#0072ff]/40 to-[#00c6ff]/40 p-3 rounded-xl hover:bg-white/20 transition-colors shadow-md border border-white/10"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "close" : "open"}
            initial={{ rotate: 0, opacity: 0.7 }}
            animate={{ rotate: isOpen ? 180 : 0, opacity: 1 }}
            exit={{ rotate: 0, opacity: 0.7 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 250 }}
          >
            {isOpen ? <X size={24} className="text-[#00e6ff]" /> : <Menu size={24} className="text-[#00e6ff]" />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-16 left-0 w-full bg-gradient-to-b from-[#0a1930] to-[#162d45] shadow-2xl flex flex-col items-center space-y-4 py-6 text-lg font-medium md:hidden z-50 backdrop-blur-xl border-b border-[#00c6ff]/20 rounded-b-2xl"
          >
            {["Home", "Chatbot", "Games"].map((item) => (
              <motion.div key={item} variants={navItemVariants} whileHover="hover" className="w-4/5">
                <NavLink
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block text-center py-3 px-6 rounded-xl transition-all duration-300 border border-transparent ${
                      isActive 
                        ? "bg-gradient-to-r from-[#0072ff]/20 to-[#00c6ff]/20 text-[#00e6ff] border-[#00c6ff]/30 shadow-[0_0_15px_rgba(0,198,255,0.2)]" 
                        : "text-white hover:bg-white/10 hover:border-white/20"
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
