import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <header className="h-screen flex items-center justify-center text-center p-5 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
      {/* Animated background overlay */}
      <motion.div 
        className="absolute inset-0 bg-black/40 z-[1]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <video className="absolute top-0 left-0 w-full h-full object-cover z-0" src="./Hero-BG/Autumn.mp4" autoPlay loop muted></video>

      <motion.div
        className="relative z-10 max-w-3xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.h2
          className="text-7xl font-bold mb-8 text-white"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Welcome to{" "}
          <motion.span
            className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Healthify
          </motion.span>
        </motion.h2>

        <motion.p
          className="text-2xl mb-12 text-white/90"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Your AI-powered mental health companion, here to support your emotional well-being and guide you towards a healthier mind.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <motion.button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-5 text-xl rounded-full shadow-xl transition-all duration-300 hover:shadow-blue-500/50"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 25px rgba(59, 130, 246, 0.6)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/chatbot')}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              Start Chatting Now! 
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.span>
          </motion.button>
        </motion.div>
      </motion.div>
    </header>
  );
};

export default Hero;
