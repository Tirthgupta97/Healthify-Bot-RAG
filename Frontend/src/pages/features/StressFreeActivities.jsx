import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const StressFreeActivities = () => {
  // Sample activities data
  const activities = [
    {
      title: "Guided Breathing",
      description: "Follow animated breathing exercises to quickly reduce stress and anxiety.",
      icon: "🫁",
      duration: "3-5 minutes"
    },
    {
      title: "Mindful Coloring",
      description: "Interactive digital coloring pages to promote focus and creativity.",
      icon: "🎨",
      duration: "Any length"
    },
    {
      title: "Relaxation Games",
      description: "Simple, engaging games designed to distract and calm your mind.",
      icon: "🎮",
      duration: "5-15 minutes"
    },
    {
      title: "Nature Sounds",
      description: "Immersive audio experiences with customizable natural environments.",
      icon: "🌳",
      duration: "Any length"
    },
    {
      title: "Guided Meditation",
      description: "Voice-guided meditation sessions for different needs and durations.",
      icon: "🧘",
      duration: "3-20 minutes"
    },
    {
      title: "Stress Journal",
      description: "Structured writing prompts to help process and release difficult emotions.",
      icon: "📓",
      duration: "5-10 minutes"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <motion.div 
        className="py-24 px-8 max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Link to="/" className="inline-flex items-center text-blue-600 mb-8 hover:text-blue-800 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
        <motion.h1 
          className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Stress-Free Activities
        </motion.h1>
        
        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <img 
            src="./home-imgs/stress.png" 
            alt="Stress-Free Activities" 
            className="w-full h-80 object-cover"
          />
        </motion.div>

        <motion.div 
          className="prose prose-lg max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Take a Break for Your Mental Health</h2>
          <p>
            In today's fast-paced world, taking time for yourself isn't a luxury—it's a necessity. 
            Healthify offers a variety of interactive activities specifically designed to reduce stress, 
            improve focus, and boost your mood, all backed by psychological research.
          </p>
          
          <h3>Why Stress-Relief Activities Matter</h3>
          <p>
            Regular engagement with stress-relief activities has been shown to lower cortisol levels, 
            improve sleep quality, enhance creativity, and build resilience against future stressors. 
            Even just 5 minutes of mindful activity can reset your nervous system and improve your outlook.
          </p>

          <h3>Our Featured Activities</h3>
          
          <div className="grid md:grid-cols-2 gap-6 my-8">
            {activities.map((activity, index) => (
              <motion.div 
                key={index}
                className="bg-blue-50 p-6 rounded-xl border border-blue-100"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl mb-2">{activity.icon}</div>
                <h4 className="text-xl font-bold text-blue-800 mb-2">{activity.title}</h4>
                <p className="text-gray-700 mb-2">{activity.description}</p>
                <div className="text-sm text-blue-600 font-medium">Duration: {activity.duration}</div>
              </motion.div>
            ))}
          </div>

          <h3>Science Behind Our Approach</h3>
          <p>
            Our activities are designed by mental health professionals and backed by research in cognitive 
            psychology and neuroscience. Each activity targets specific neural pathways associated with 
            stress response and relaxation, helping to build lasting mental resilience.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-xl my-8 border border-blue-100">
            <h4 className="text-blue-800 font-bold">Ready to Relax?</h4>
            <p>Try our interactive activities and discover what works best for your unique needs.</p>
            <button className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-6 py-3 rounded-lg font-medium mt-2 hover:shadow-lg transition-shadow">
              Explore Activities
            </button>
          </div>

          <h3>Tips for Building a Daily Stress-Relief Routine</h3>
          <ol>
            <li>Start small with 3-5 minute sessions</li>
            <li>Schedule activities as calendar appointments</li>
            <li>Try different activities to find what resonates with you</li>
            <li>Track your mood before and after to notice improvements</li>
            <li>Gradually build up to longer sessions as you see benefits</li>
          </ol>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StressFreeActivities;
