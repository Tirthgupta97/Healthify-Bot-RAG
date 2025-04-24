import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MoodTracking = () => {
  // Sample chart data visualization
  const demoData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    levels: [3, 4, 2, 5, 4, 6, 5]
  };
  
  // Max level (out of 7) for normalizing heights
  const maxLevel = 7;

  // Sample mood factors
  const moodFactors = [
    { name: "Sleep", icon: "💤" },
    { name: "Exercise", icon: "🏃" },
    { name: "Nutrition", icon: "🍎" },
    { name: "Social", icon: "👥" },
    { name: "Stress", icon: "😓" },
    { name: "Medication", icon: "💊" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <motion.div 
        className="py-24 px-8 max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Link to="/" className="inline-flex items-center text-amber-600 mb-8 hover:text-amber-800 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
        <motion.h1 
          className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Mood Tracking Tools
        </motion.h1>
        
        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <img 
            src="https://thumbs.dreamstime.com/b/screenshot-mood-tracking-apps-calendar-feature-showing-months-worth-data-colorful-bars-vector-illustration-319048013.jpg" 
            alt="Mood Tracking" 
            className="w-full h-80 object-cover"
          />
        </motion.div>

        <motion.div 
          className="prose prose-lg max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Track, Understand, and Improve Your Mental Well-being</h2>
          <p>
            What gets measured gets managed. Healthify's Mood Tracking feature helps you monitor your emotional 
            patterns over time, identify triggers, and develop strategies to enhance your mental wellness.
          </p>
          
          <h3>Key Benefits of Mood Tracking</h3>
          <ul>
            <li><strong>Pattern Recognition</strong> - Identify which activities, people, or situations affect your mood</li>
            <li><strong>Early Warning System</strong> - Detect downward trends before they become serious</li>
            <li><strong>Treatment Effectiveness</strong> - See how lifestyle changes or therapies are working</li>
            <li><strong>Communication Tool</strong> - Share accurate mood data with healthcare providers</li>
            <li><strong>Self-Awareness</strong> - Develop a deeper understanding of your emotional life</li>
          </ul>

          {/* Demo Visualization */}
          <div className="my-12 bg-white rounded-xl p-6 shadow-sm border border-amber-100">
            <h3 className="text-xl font-bold text-amber-700 mb-6">Sample Mood Visualization</h3>
            <div className="flex items-end justify-between h-64 pb-8">
              {demoData.labels.map((day, index) => {
                const height = (demoData.levels[index] / maxLevel) * 100;
                let color;
                if (demoData.levels[index] <= 2) color = "bg-red-400";
                else if (demoData.levels[index] <= 4) color = "bg-amber-400";
                else color = "bg-green-400";
                
                return (
                  <motion.div 
                    key={index} 
                    className="flex flex-col items-center w-1/8"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.1 * index, duration: 0.8, type: "spring" }}
                  >
                    <div className={`w-12 rounded-t-lg ${color}`} style={{ height: "100%" }}></div>
                    <div className="mt-2 text-gray-600">{day}</div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 px-2">
              <span className="text-xs text-gray-500">Poor</span>
              <span className="text-xs text-gray-500">Excellent</span>
            </div>
          </div>

          <h3>Features of Our Mood Tracker</h3>
          <div className="grid md:grid-cols-2 gap-6 my-8">
            <div className="bg-amber-50 p-6 rounded-xl">
              <h4 className="font-bold text-amber-800">Quick Daily Check-ins</h4>
              <p>Simple, one-tap mood logging takes less than 10 seconds</p>
            </div>
            <div className="bg-amber-50 p-6 rounded-xl">
              <h4 className="font-bold text-amber-800">Customizable Factors</h4>
              <p>Track sleep, exercise, medication, social activity and more</p>
            </div>
            <div className="bg-amber-50 p-6 rounded-xl">
              <h4 className="font-bold text-amber-800">Journal Integration</h4>
              <p>Add notes to explain the context behind your feelings</p>
            </div>
            <div className="bg-amber-50 p-6 rounded-xl">
              <h4 className="font-bold text-amber-800">Interactive Reports</h4>
              <p>Visualize trends with easy-to-understand charts and graphs</p>
            </div>
          </div>

          <h3>Track What Matters to You</h3>
          <p>
            Everyone's mental health journey is unique. Our mood tracking tool lets you customize which factors to monitor 
            based on what affects you most. Here are some common factors our users track:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
            {moodFactors.map((factor, index) => (
              <motion.div
                key={index}
                className="flex items-center p-4 bg-white rounded-lg border border-amber-100"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="text-2xl mr-3">{factor.icon}</span>
                <span className="text-gray-700">{factor.name}</span>
              </motion.div>
            ))}
          </div>

          <h3>The Science of Mood Tracking</h3>
          <p>
            Research in cognitive behavioral therapy suggests that regular mood monitoring increases emotional 
            intelligence and equips individuals with better coping strategies. By bringing awareness to your 
            emotional patterns, you can make informed decisions about lifestyle changes, stress management 
            techniques, and when to seek additional support.
          </p>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl my-8 border border-amber-100">
            <h4 className="text-amber-800 font-bold">Start Tracking Today</h4>
            <p>Begin your journey to better mental health awareness with our easy-to-use mood tracking tools.</p>
            <button className="bg-gradient-to-r from-amber-600 to-orange-500 text-white px-6 py-3 rounded-lg font-medium mt-2 hover:shadow-lg transition-shadow">
              Set Up Mood Tracking
            </button>
          </div>

          <h3>Privacy and Data Security</h3>
          <p>
            Your mental health data is sensitive and personal. That's why we implement the highest standards 
            of encryption and privacy protection. Your mood tracking data is stored securely and never shared 
            with third parties without your explicit permission. You have complete control over your data, 
            including the ability to export or delete it at any time.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MoodTracking;
