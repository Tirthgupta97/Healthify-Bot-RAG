import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const GlobalSupport = () => {
  // Sample region data
  const regions = [
    {
      name: "North America",
      resources: [
        { name: "National Suicide Prevention Lifeline (US)", contact: "988 or 1-800-273-8255" },
        { name: "Crisis Services Canada", contact: "1-833-456-4566" },
        { name: "Mexico Crisis Line", contact: "555-510-2550" }
      ]
    },
    {
      name: "Europe",
      resources: [
        { name: "Samaritans (UK)", contact: "116 123" },
        { name: "SOS Amitié (France)", contact: "01 45 39 40 00" },
        { name: "Telefonseelsorge (Germany)", contact: "0800 111 0 111" }
      ]
    },
    {
      name: "Asia & Oceania",
      resources: [
        { name: "Lifeline Australia", contact: "13 11 14" },
        { name: "Japan Suicide Prevention Hotline", contact: "03-5774-0992" },
        { name: "Vandrevala Foundation (India)", contact: "1860 2662 345" }
      ]
    },
    {
      name: "Africa & Middle East",
      resources: [
        { name: "South African Depression and Anxiety Group", contact: "0800 567 567" },
        { name: "Befrienders Cairo (Egypt)", contact: "762 1602/3" },
        { name: "ERAN (Israel)", contact: "1201" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <motion.div 
        className="py-24 px-8 max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Link to="/" className="inline-flex items-center text-green-600 mb-8 hover:text-green-800 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
        <motion.h1 
          className="text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Global Support Network
        </motion.h1>
        
        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <img 
            src="https://img.freepik.com/free-photo/hands-holding-earth-csr-business-campaign_53876-127168.jpg" 
            alt="Global Support" 
            className="w-full h-80 object-cover"
          />
        </motion.div>

        <motion.div 
          className="prose prose-lg max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Mental Health Support Knows No Borders</h2>
          <p>
            Healthify is committed to connecting people with mental health resources worldwide. 
            No matter where you are, we believe everyone deserves access to support during difficult times.
          </p>
          
          <h3>Our Global Network Includes:</h3>
          <ul>
            <li><strong>Crisis Helplines</strong> - Immediate support in multiple languages</li>
            <li><strong>Local Resources</strong> - Mental health services specific to your region</li>
            <li><strong>Online Communities</strong> - Connect with others facing similar challenges</li>
            <li><strong>Cultural Considerations</strong> - Resources that understand your cultural context</li>
            <li><strong>International Therapy Options</strong> - Both in-person and telehealth</li>
          </ul>

          <div className="my-12">
            <h3 className="text-2xl font-bold text-green-700 mb-6">Global Crisis Resources</h3>
            
            <div className="space-y-8">
              {regions.map((region, index) => (
                <motion.div 
                  key={index}
                  className="bg-white border border-green-100 rounded-xl p-6 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.5 }}
                >
                  <h4 className="text-xl font-bold text-green-600 mb-4">{region.name}</h4>
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-gray-500 pb-2">Organization</th>
                        <th className="text-left text-gray-500 pb-2">Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {region.resources.map((resource, i) => (
                        <tr key={i} className="border-t border-green-50">
                          <td className="py-3 pr-4">{resource.name}</td>
                          <td className="py-3 font-medium text-green-700">{resource.contact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              ))}
            </div>
          </div>

          <h3>How Our Global Support Works</h3>
          <p>
            When you use Healthify, we can detect your location (with permission) to suggest relevant local resources. 
            You can also manually search for resources in any region, making Healthify useful whether you're at home or traveling.
          </p>
          
          <p>
            Our team regularly updates the database of global resources, verifying contact information and adding new services as they become available.
          </p>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl my-8 border border-green-100">
            <h4 className="text-green-800 font-bold">Need Support Now?</h4>
            <p>Find mental health resources in your area with our global directory.</p>
            <button className="bg-gradient-to-r from-green-600 to-teal-500 text-white px-6 py-3 rounded-lg font-medium mt-2 hover:shadow-lg transition-shadow">
              Find Local Resources
            </button>
          </div>
          
          <h3>Contribute to Our Network</h3>
          <p>
            Know of a mental health resource that isn't in our directory? Help us expand our global 
            network by suggesting new resources to include. Together, we can ensure that quality mental health 
            support is accessible to everyone, everywhere.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GlobalSupport;
