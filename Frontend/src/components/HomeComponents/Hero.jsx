import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <header className="h-[80vh] flex items-center justify-center text-center p-5 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">

      <video className="absolute top-0 left-0 w-full h-full object-cover z-0" src="./Hero-BG/Autumn.mp4" autoPlay loop muted></video>

      <motion.div
        className=" p-10 rounded-2xl text-gray-800 w-3/4 max-w-3xl relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h2
          className="text-5xl font-bold mb-4 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Welcome to Healthify
        </motion.h2>
        <motion.p
          className="text-lg mb-6 text-white"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Your AI-powered mental health companion, here to support your emotional well-being and guide you towards a healthier mind.
        </motion.p>
        <motion.button
          className="bg-blue-500 text-white px-6 py-3 text-lg rounded-lg shadow-md transition-all duration-300 transform hover:bg-blue-600 cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/chatbot')}
        >
          Start Chatting Now!
        </motion.button>
      </motion.div>
    </header>
  );
};

export default Hero;
