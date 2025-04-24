import React from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { Heart, ArrowUp } from "lucide-react";

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Chatbot", path: "/chatbot" },
    { name: "Games", path: "/games" }
  ];

  const resourceLinks = [
    { name: "Health Articles", path: "/articles" },
    { name: "Wellness Tips", path: "/tips" },
    { name: "FAQ", path: "/faq" }
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Cookies", path: "/cookies" }
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white py-6 px-4 md:py-8 md:px-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10"></div>

      {/* Back to top button */}
      <motion.div 
        className="absolute right-3 md:right-6 top-3 z-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={scrollToTop}
          whileHover={{ scale: 1.1, backgroundColor: "#4F46E5" }}
          whileTap={{ scale: 0.95 }}
          className="bg-white/10 backdrop-blur-sm p-1.5 rounded-full border border-white/20 text-white"
          aria-label="Back to top"
        >
          <ArrowUp size={18} />
        </motion.button>
      </motion.div>

      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        variants={containerVariants}
      >
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="mb-2 md:mb-0">
            <motion.h2
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight leading-tight"
              whileHover={{ scale: 1.05 }}
            >
              Healthify
            </motion.h2>
            <motion.p
              className="text-sm md:text-base text-white/90 font-medium tracking-wide flex items-center"
              variants={itemVariants}
            >
              Your AI-powered wellness companion
              <motion.span
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block ml-2"
              >
                <Heart size={16} className="fill-blue-700" />
              </motion.span>
            </motion.p>
          </motion.div>

          {/* Navigation Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-base md:text-lg font-semibold mb-2 text-blue-300">Navigation</h3>
            <ul className="space-y-1.5">
              {navLinks.map((link) => (
                <motion.li key={link.name} whileHover={{ x: 3 }}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `text-sm md:text-base hover:text-blue-300 transition-colors ${
                        isActive ? "text-blue-300" : "text-white/80"
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h3 className="text-base md:text-lg font-semibold mb-2 text-blue-300">Resources</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {resourceLinks.map((link) => (
                <motion.li key={link.name} whileHover={{ x: 3 }}>
                  <NavLink
                    to={link.path}
                    className="text-sm md:text-base text-white/80 hover:text-blue-300 transition-colors"
                  >
                    {link.name}
                  </NavLink>
                </motion.li>
              ))}
              {legalLinks.map((link) => (
                <motion.li key={link.name} whileHover={{ x: 3 }}>
                  <NavLink
                    to={link.path}
                    className="text-sm md:text-base text-white/80 hover:text-blue-300 transition-colors"
                  >
                    {link.name}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="text-center text-sm md:text-base text-white/60 border-t border-white/10 pt-3 mt-3"
          variants={itemVariants}
        >
          <motion.p whileHover={{ color: "#fff" }} transition={{ duration: 0.3 }}>
            © {new Date().getFullYear()} Healthify. All Rights Reserved.
          </motion.p>
          <p className="mt-1 text-xs md:text-sm text-white/40">
            Healthify is committed to providing reliable health information but is not a substitute for professional medical advice.
          </p>
        </motion.div>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
