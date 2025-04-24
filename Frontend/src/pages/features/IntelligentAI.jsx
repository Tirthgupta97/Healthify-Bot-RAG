import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const IntelligentAI = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <motion.div 
        className="py-24 px-8 max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Link to="/" className="inline-flex items-center text-purple-600 mb-8 hover:text-purple-800 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
        <motion.h1 
          className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Intelligent AI Companion
        </motion.h1>
        
        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <img 
            src="https://www.jonesday.com/-/media/images/publications/2022/03/which-ai-components-are-copyright-protectable/articleimage/which_ai_components_are_copyright_protectable_soc.jpeg?rev=76293a46253745c5a4f95842bec945b8&la=en&h=800&w=1600&hash=1F73AF566F557765D950461B0485D246" 
            alt="AI Companion" 
            className="w-full h-80 object-cover"
          />
        </motion.div>

        <motion.div 
          className="prose prose-lg max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2>How Our AI Supports Your Mental Health</h2>
          <p>
            Healthify's Intelligent AI is designed with empathy and understanding at its core. Unlike standard chatbots, 
            our AI companion is specifically trained on mental health conversations, therapeutic techniques, and emotional intelligence.
          </p>
          
          <h3>Key Features of Our AI Companion:</h3>
          <ul>
            <li><strong>24/7 Availability</strong> - Get support whenever you need it, day or night.</li>
            <li><strong>Personalized Conversations</strong> - The AI learns your preferences and adapts to your communication style.</li>
            <li><strong>Evidence-Based Approaches</strong> - Incorporates techniques from cognitive behavioral therapy, mindfulness, and positive psychology.</li>
            <li><strong>Judgment-Free Zone</strong> - Share your thoughts freely without fear of criticism.</li>
            <li><strong>Privacy-Focused</strong> - Your conversations remain confidential and secure.</li>
          </ul>

          <h3>How It Works</h3>
          <p>
            Our AI uses natural language processing to understand the context and emotional tone of your messages. 
            It responds with thoughtful, supportive messages that help you explore your feelings and develop coping strategies.
          </p>
          <p>
            While the AI is not a replacement for professional mental health care, it serves as an accessible first step and 
            ongoing support companion in your mental wellness journey.
          </p>

          <h3>Research-Backed Technology</h3>
          <p>
            Developed in collaboration with mental health professionals, our AI incorporates the latest research in 
            digital mental health interventions. Studies have shown that AI companions can help reduce feelings of 
            loneliness, provide emotional support, and guide users toward positive coping mechanisms.
          </p>

          <div className="bg-purple-50 p-6 rounded-xl my-8">
            <h4 className="text-purple-800 font-bold">Try It Now</h4>
            <p>Start a conversation with our AI companion and experience the difference a supportive digital presence can make in your day.</p>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium mt-2 hover:shadow-lg transition-shadow">
              Chat with Healthify AI
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IntelligentAI;
