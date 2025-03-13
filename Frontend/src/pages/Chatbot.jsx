import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Mic, Send, Volume2, Trash2 } from "lucide-react";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
  
      recognitionInstance.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsVoiceMode(true); // Set voice mode
        // Small delay to ensure the input is set
        setTimeout(async () => {
          await sendMessage(transcript, true); // Pass true to indicate voice mode
        }, 100);
      };
  
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsVoiceMode(false);
      };
  
      recognitionInstance.onend = () => {
        setIsVoiceMode(false);
      };
  
      setRecognition(recognitionInstance);
    } else {
      console.error('Speech recognition not supported');
    }
  }, []);

  const textToSpeech = (text) => {
    if (!text) return;

    // Toggle speech off if already speaking
    if (window.speechSynthesis.speaking && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean up the text for speech
    const cleanText = text
      .replace(/<[^>]*>/g, '')
      .replace(/💚/g, '')
      .replace(/💫/g, '')
      .replace(/\*\*/g, '')
      .replace(/##/g, '')
      .replace(/<break time="2s"\/>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const speech = new SpeechSynthesisUtterance(cleanText);
    
    speech.lang = "en-US";
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;
    
    speech.onstart = () => {
      setIsSpeaking(true);
    };

    speech.onend = () => {
      setIsSpeaking(false);
    };

    speech.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
  };

  const sendMessage = async (transcriptText, isVoiceInput = false) => {
    const messageText = transcriptText || input;
    if (!messageText.trim()) return;

    // Only cancel speech if currently speaking, but preserve the messages
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const userMessage = { sender: "user", text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: messageText }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.reply };
      
      // Use the callback form of setMessages to ensure we're working with the latest state
      setMessages(prev => [...prev, botMessage]);

      // Speak response if in voice mode or if input was from voice
      if (isVoiceMode || isVoiceInput) {
        // Small delay to ensure the previous speech is properly cleaned up
        setTimeout(() => {
          textToSpeech(data.reply);
        }, 100);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: "Error connecting to AI backend." 
      }]);
    }
  };

  const startVoiceRecognition = () => {
    if (recognition) {
      setIsVoiceMode(true);
      recognition.start();
    } else {
      console.error('Speech recognition not initialized');
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add this function after other state declarations at the top
  const clearChat = () => {
    setMessages([]);
  };

  const renderMarkdownContent = (text) => {
    // First, clean up any HTML tags from the response
    const cleanText = text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML spaces
      .replace(/\n{3,}/g, '\n\n'); // Normalize multiple line breaks

    // Split into sections based on headers and bullet points
    const parts = cleanText.split(/(?=##\s|•\s|\*\*)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('## ')) {
        return (
          <motion.h2
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold text-indigo-700 mt-4 mb-3"
          >
            {part.replace('## ', '')}
          </motion.h2>
        );
      } else if (part.startsWith('• ')) {
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 ml-2 mb-2"
          >
            <span className="text-indigo-600 text-xl">•</span>
            <span className="flex-1">{part.replace('• ', '')}</span>
          </motion.div>
        );
      } else if (part.startsWith('**')) {
        return (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold inline-block"
          >
            {part.replace(/\*\*/g, '')}
          </motion.span>
        );
      } else {
        return (
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 leading-relaxed"
          >
            {part.trim()}
          </motion.p>
        );
      }
    });
  };

  return (  
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-100 to-white px-4 sm:px-8 overflow-hidden mt-16">
      {/* Background Animation Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 -top-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-2000"></div>
        <div className="absolute -bottom-10 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-4000"></div>
      </div>

      {/* Chatbot Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full h-[90vh] mx-auto p-4 sm:p-6 bg-white/80 shadow-2xl rounded-3xl backdrop-blur-lg border border-white/50 flex flex-col"
      >
        {/* Chatbot Header */}
        <div className="text-center text-indigo-700 text-xl sm:text-2xl font-semibold pb-3 border-b border-indigo-300">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            Healthify AI Chatbot
          </motion.div>
        </div>

        {/* Messages Box */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 mt-2 sm:mt-4 bg-white/50 border border-indigo-200 rounded-xl shadow-inner"
          style={{
            backgroundImage: "url('data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E')"
          }}
        >
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } mb-3 sm:mb-4`}
              >
                {msg.sender === "bot" ? (
                  <div className="flex items-start gap-2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="message-section hover-scale bg-white rounded-xl px-4 py-3 shadow-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span role="img" aria-label="robot" className="text-xl">🤖</span>
                        <h2 className="font-semibold text-indigo-700">Healthify AI</h2>
                      </div>
                      <div className="prose prose-indigo max-w-none">
                        {renderMarkdownContent(msg.text)}
                      </div>
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => textToSpeech(msg.text)}
                      className={`p-2 rounded-full ${
                        isSpeaking 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'hover:bg-indigo-100 text-indigo-600'
                      }`}
                    >
                      <Volume2 size={20} />
                    </motion.button>
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg"
                  >
                    {msg.text}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input and Buttons */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex mt-3 sm:mt-5 gap-2 sm:gap-3"
        >
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="text"
            className="flex-1 px-4 py-2 border border-indigo-400 rounded-full outline-none focus:ring-2 focus:ring-indigo-300 text-sm sm:text-lg transition-all bg-white/80 backdrop-blur-sm"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            className="bg-red-500 text-white p-3 sm:p-4 rounded-full hover:bg-red-600 transition-all flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer"
          >
            <Trash2 size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startVoiceRecognition}
            className="bg-gradient-to-r from-red-500 via-purple-500 to-indigo-500 text-white p-3 sm:p-4 rounded-full hover:opacity-90 transition-all flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer"
          >
            <Mic size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-3 sm:p-4 rounded-full hover:opacity-90 transition-all flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer"
          >
            <Send size={20} />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Chatbot;
