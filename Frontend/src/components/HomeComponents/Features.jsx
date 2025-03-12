import { motion } from "framer-motion";

const Features = () => {
  const features = [
    { title: "AI-Powered Chat", desc: "Chat with an AI that understands your emotions and supports you.", img: "https://nextr.in/blog/wp-content/uploads/2023/06/AI-Powered-Chatbots-for-Marketing.jpg" },
    { title: "Relaxing Games", desc: "Engage in stress-relieving and refreshing activities.", img: "https://media.smallbiztrends.com/2022/04/relaxing-games.png" },
    { title: "Guided Meditation", desc: "Try breathing exercises and meditation techniques.", img: "https://static.vecteezy.com/system/resources/thumbnails/026/717/009/small/women-meditate-yoga-psychic-women-considers-mind-and-heart-spirituality-esotericism-with-bokeh-defocused-lights-universe-generative-ai-illustration-free-photo.jpg" },
    { title: "Helpful Resources", desc: "Explore mental health guides and crisis support services.", img: "https://www.zps.org/downloads/adams/links-and-resources.jpg" },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-blue-100 to-purple-100 text-center">
      <motion.h2
        className="text-4xl text-gray-900 font-bold mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        What Healthify Offers
      </motion.h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-5">
        {features.map((feature, index) => (
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

export default Features;
