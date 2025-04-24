import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const About = () => {
  const aboutFeatures = [
    { title: "Intelligent AI", desc: "Engage in meaningful conversations with an empathetic AI.", img: "https://www.jonesday.com/-/media/images/publications/2022/03/which-ai-components-are-copyright-protectable/articleimage/which_ai_components_are_copyright_protectable_soc.jpeg?rev=76293a46253745c5a4f95842bec945b8&la=en&h=800&w=1600&hash=1F73AF566F557765D950461B0485D246", link: "/features/intelligent-ai" },
    { title: "Stress-Free Activities", desc: "Interactive games and exercises to help you relax.", img: "./home-imgs/stress.png", link: "/features/stress-free-activities" },
    { title: "Global Support", desc: "Access mental health resources, helplines, and guidance worldwide.", img: "https://img.freepik.com/free-photo/hands-holding-earth-csr-business-campaign_53876-127168.jpg", link: "/features/global-support" },
    { title: "Mood Tracking", desc: "Monitor your mental well-being over time with easy tracking tools.", img: "https://thumbs.dreamstime.com/b/screenshot-mood-tracking-apps-calendar-feature-showing-months-worth-data-colorful-bars-vector-illustration-319048013.jpg", link: "/features/mood-tracking" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const featureVariants = {
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
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const MotionLink = motion(Link);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated background with gradient */}
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
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute w-64 h-64 rounded-full bg-purple-200/30 blur-3xl"
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{ top: '5%', right: '10%' }}
        />
        <motion.div 
          className="absolute w-72 h-72 rounded-full bg-blue-200/30 blur-3xl"
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          style={{ bottom: '15%', left: '5%' }}
        />
      </div>

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
          className="text-xl max-w-3xl mx-auto mb-16 text-gray-700 px-8 text-center"
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
          className="max-w-7xl mx-auto px-5 space-y-24 md:space-y-32"
        >
          {aboutFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={featureVariants}
              whileHover="hover"
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 relative`}
            >
              {/* Feature image with floating effect */}
              <motion.div 
                className="w-full md:w-1/2 relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-3xl transform rotate-3 scale-105"
                    whileHover={{ rotate: 1, scale: 1.06 }}
                    transition={{ duration: 0.4 }}
                  />
                  <motion.div 
                    className="overflow-hidden rounded-2xl relative z-10"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.img
                      src={feature.img}
                      alt={feature.title}
                      className="w-full h-80 object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-6">
                        <div className="h-1 w-12 bg-white mb-4 rounded-full"></div>
                        <p className="text-white text-lg font-medium">Discover more</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Feature content */}
              <div className="w-full md:w-1/2 relative">
                <motion.div 
                  className="absolute -inset-4 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                />
                <motion.div
                  className="relative z-10 p-8"
                  initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-700 text-sm font-medium mb-4">
                    Feature {index + 1}
                  </span>
                  <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-xl mb-6 leading-relaxed">
                    {feature.desc}
                  </p>
                  <MotionLink
                    to={feature.link}
                    className="group flex items-center text-purple-600 font-medium"
                    whileHover={{ x: 5 }}
                  >
                    Learn more
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </MotionLink>
                </motion.div>
              </div>
              
              {/* Decorative elements based on index */}
              {index % 2 === 0 && (
                <motion.div 
                  className="absolute -z-10 w-40 h-40 rounded-full border-4 border-purple-200/50"
                  style={{ top: '-10%', right: '20%' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />
              )}
              {index % 2 === 1 && (
                <motion.div 
                  className="absolute -z-10 w-24 h-24 rounded-md border-4 border-blue-200/50"
                  style={{ bottom: '-5%', left: '15%' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default About;
