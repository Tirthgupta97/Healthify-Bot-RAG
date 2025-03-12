import { motion } from "framer-motion";

const About = () => {
  const aboutFeatures = [
    { title: "Intelligent AI", desc: "Engage in meaningful conversations with an empathetic AI.", img: "https://www.jonesday.com/-/media/images/publications/2022/03/which-ai-components-are-copyright-protectable/articleimage/which_ai_components_are_copyright_protectable_soc.jpeg?rev=76293a46253745c5a4f95842bec945b8&la=en&h=800&w=1600&hash=1F73AF566F557765D950461B0485D246" },
    { title: "Stress-Free Activities", desc: "Interactive games and exercises to help you relax.", img: "https://cdn.fourthwall.com/offer/sh_7a6bdcf5-93c5-46c1-a77f-c6541a057c49/7ec683b8-3751-414f-845c-b144a6bd371f.png" },
    { title: "Global Support", desc: "Access mental health resources, helplines, and guidance worldwide.", img: "https://img.freepik.com/free-photo/hands-holding-earth-csr-business-campaign_53876-127168.jpg" },
    { title: "Mood Tracking", desc: "Monitor your mental well-being over time with easy tracking tools.", img: "https://thumbs.dreamstime.com/b/screenshot-mood-tracking-apps-calendar-feature-showing-months-worth-data-colorful-bars-vector-illustration-319048013.jpg" },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50 text-center">
      <motion.h2
        className="text-4xl text-gray-900 font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Why Choose Healthify?
      </motion.h2>
      <motion.p
        className="text-lg max-w-3xl mx-auto mb-10 text-gray-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Mental health is as important as physical health. Healthify listens, understands, and supports you when you need it most.
      </motion.p>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-5">
        {aboutFeatures.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transform transition duration-300 hover:scale-105 hover:shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          >
            <img src={feature.img} alt={feature.title} className="w-full h-40 object-cover rounded-lg mb-3" />
            <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default About;
