import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"; // Lucide React Icons

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">

        {/* Left Section - Brand Info */}
        <div className="mb-6 md:mb-0">
          <h2 className="text-2xl font-bold">Healthify</h2>
          <p className="text-sm opacity-80 mt-1">Your AI-powered <br /> wellness companion 💙</p>
        </div>

        {/* Center Section - Navigation Links */}
        <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm">
          <a href="/" className="hover:text-blue-400 transition">Home</a>
          <a href="/chatbot" className="hover:text-blue-400 transition">Chatbot</a>
          <a href="/games" className="hover:text-blue-400 transition">Games</a>
        </div>

        {/* Right Section - Social Media Links */}
        <div className="flex space-x-4 mt-6 md:mt-0">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <Facebook size={22} className="hover:text-blue-500 transition" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <Twitter size={22} className="hover:text-blue-400 transition" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <Instagram size={22} className="hover:text-pink-500 transition" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <Linkedin size={22} className="hover:text-blue-600 transition" />
          </a>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="text-center text-xs opacity-70 mt-6">
        © {new Date().getFullYear()} Healthify. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
