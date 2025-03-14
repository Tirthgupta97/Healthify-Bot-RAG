import { motion } from "framer-motion";

const Features = () => {
  const features = [
    { title: "AI-Powered Chat", desc: "Chat with an AI that understands your emotions and supports you.", img: "https://nextr.in/blog/wp-content/uploads/2023/06/AI-Powered-Chatbots-for-Marketing.jpg" },
    { title: "Relaxing Games", desc: "Engage in stress-relieving and refreshing activities.", img: "https://media.smallbiztrends.com/2022/04/relaxing-games.png" },
    { title: "Guided Meditation", desc: "Try breathing exercises and meditation techniques.", img: "https://static.vecteezy.com/system/resources/thumbnails/026/717/009/small/women-meditate-yoga-psychic-women-considers-mind-and-heart-spirituality-esotericism-with-bokeh-defocused-lights-universe-generative-ai-illustration-free-photo.jpg" },
    { title: "Helpful Resources", desc: "Explore mental health guides and crisis support services.", img: "https://www.zps.org/downloads/adams/links-and-resources.jpg" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-blue-100 to-purple-100 text-center relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "linear-gradient(0deg, #e0f2fe 0%, #f3e8ff 100%)",
            "linear-gradient(180deg, #e0f2fe 0%, #f3e8ff 100%)",
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      <motion.h2
        className="text-5xl text-gray-900 font-bold mb-12 relative"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        What <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Healthify</span> Offers
      </motion.h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-6"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover="hover"
            className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/20 transform transition-all duration-300"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="overflow-hidden rounded-xl mb-4"
            >
              <motion.img
                src={feature.img}
                alt={feature.title}
                className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              />
            </motion.div>
            <motion.h3
              className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.3 }}
            >
              {feature.title}
            </motion.h3>
            <motion.p
              className="text-gray-600 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.4 }}
            >
              {feature.desc}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Features;
