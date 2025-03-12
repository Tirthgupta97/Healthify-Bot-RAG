import { motion } from "framer-motion";

const About = () => {
  const aboutFeatures = [
    { title: "Intelligent AI", desc: "Engage in meaningful conversations with an empathetic AI.", img: "https://www.jonesday.com/-/media/images/publications/2022/03/which-ai-components-are-copyright-protectable/articleimage/which_ai_components_are_copyright_protectable_soc.jpeg?rev=76293a46253745c5a4f95842bec945b8&la=en&h=800&w=1600&hash=1F73AF566F557765D950461B0485D246" },
    { title: "Stress-Free Activities", desc: "Interactive games and exercises to help you relax.", img: "https://cdn.fourthwall.com/offer/sh_7a6bdcf5-93c5-46c1-a77f-c6541a057c49/7ec683b8-3751-414f-845c-b144a6bd371f.png" },
    { title: "Global Support", desc: "Access mental health resources, helplines, and guidance worldwide.", img: "https://img.freepik.com/free-photo/hands-holding-earth-csr-business-campaign_53876-127168.jpg" },
    { title: "Mood Tracking", desc: "Monitor your mental well-being over time with easy tracking tools.", img: "https://thumbs.dreamstime.com/b/screenshot-mood-tracking-apps-calendar-feature-showing-months-worth-data-colorful-bars-vector-illustration-319048013.jpg" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    hover: {
      y: -10,
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50"
        animate={{
          background: [
            "linear-gradient(to right, #f3e8ff, #e0f2fe)",
            "linear-gradient(to right, #e0f2fe, #f3e8ff)"
          ]
        }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
      />

      <div className="relative z-10">
        <motion.h2
          className="text-center text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-relaxed py-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Why Choose Healthify?
        </motion.h2>

        <motion.p
          className="text-xl max-w-3xl mx-auto mb-16 text-gray-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Mental health is as important as physical health. Healthify listens, understands, and supports you when you need it most.
        </motion.p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-5"
        >
          {aboutFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/20 flex flex-col"
            >
              <motion.div
                className="overflow-hidden rounded-2xl mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <motion.img
                  src={feature.img}
                  alt={feature.title}
                  className="w-full h-48 object-cover transform transition-transform duration-500 hover:scale-110"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
              
              <motion.h3
                className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {feature.title}
              </motion.h3>
              
              <motion.p
                className="text-gray-600 text-lg flex-grow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {feature.desc}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default About;
