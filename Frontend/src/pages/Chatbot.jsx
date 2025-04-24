import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { 
  Mic, Send, Volume2, Trash2, 
  History, ArrowLeft, Clock, XCircle, 
  Loader2, Globe, Sparkles, User, Bot, 
  RefreshCw, Maximize, Minimize,
  Heart, Smile, Frown, Meh // Add these icons for sentiment display
} from "lucide-react";
import { Link, useLocation } from "react-router-dom"; // Add useLocation hook

// Game suggestions data - add this after imports
const gamesSuggestions = [
  { name: "Hang Man", path: "/Hang-Man", icon: "🎮" },
  { name: "Soothing Soundboard", path: "/Sound-board", icon: "🔊" },
  { name: "Mindful Breathing", path: "/Breathing", icon: "🧘" },
  { name: "Memory Match", path: "/Memory-Match", icon: "🧠" }
];

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const chatContainerRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [detectedLanguage, setDetectedLanguage] = useState("en");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messageSentiments, setMessageSentiments] = useState({}); // Add sentiment tracking
  const location = useLocation(); // Add this to track navigation changes

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      // Set language based on detected language, using better options for transliterated text
      if (detectedLanguage === 'ta-en' || detectedLanguage === 'hi-en') {
        recognitionInstance.lang = 'en-IN'; // Indian English is better for Tamil-English
      } else {
        recognitionInstance.lang = detectedLanguage === 'en' ? 'en-US' : detectedLanguage;
      }
  
      recognitionInstance.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsVoiceMode(true);
        setTimeout(async () => {
          await sendMessage(transcript, true);
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
  }, [detectedLanguage]); // Update when detected language changes

  useEffect(() => {
    fetchActiveSession();
  }, [location.pathname]); // Re-fetch when user navigates back to the chat

  useEffect(() => {
    if (showHistory) {
      fetchChatHistory();
    }
  }, [showHistory]);

  const fetchActiveSession = async () => {
    try {
      const response = await fetch("https://healthify-bot-rag.onrender.com/active-session");
      
      if (!response.ok) {
        console.error(`Failed to fetch active session. Status: ${response.status}`);
        return;
      }
      
      const sessionData = await response.json();
      
      if (sessionData && sessionData.messages && sessionData.messages.length > 0) {
        console.log("✅ Active session loaded:", sessionData.id);
        
        const sessionMessages = [];
        
        sessionData.messages.forEach(msg => {
          if (msg.query) sessionMessages.push({ sender: "user", text: msg.query });
          if (msg.answer) sessionMessages.push({ sender: "bot", text: msg.answer });
        });
        
        setMessages(sessionMessages);
        setActiveSessionId(sessionData.id);
      } else {
        setMessages([]);
        setActiveSessionId(null);
      }
    } catch (error) {
      console.error("Error fetching active session:", error);
    }
  };

  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Fetching chat history...");
      
      const response = await fetch("https://healthify-bot-rag.onrender.com/history");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch history. Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        console.log(`✅ Fetched ${data.length} chat sessions`);
        setChatHistory(data);
      } else {
        console.error("❌ Invalid chat history format:", data);
        setChatHistory([]);
      }
    } catch (error) {
      console.error("🚨 Error fetching chat history:", error);
      setChatHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const textToSpeech = (text) => {
    if (!text) return;

    if (window.speechSynthesis.speaking && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/##/g, '')
      .replace(/[💚💫✨🌟🤗💪]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const speech = new SpeechSynthesisUtterance(cleanText);
    
    // Adjust speech parameters based on detected language
    if (detectedLanguage === 'ta-en') {
      // Better settings for Tamil-English
      speech.lang = "en-IN"; // Indian English often handles Tanglish better
      speech.rate = 0.85; // Slightly slower rate for clearer pronunciation
      speech.pitch = 1.1; // Slight pitch adjustment
    } else if (detectedLanguage === 'hi-en') {
      speech.lang = "en-IN"; // Indian English for Hindi-English
      speech.rate = 0.85;
      speech.pitch = 1.05;
    } else {
      speech.lang = detectedLanguage.startsWith('en') ? "en-US" : detectedLanguage;
      speech.rate = 0.9;
      speech.pitch = 1.05;
    }
    
    speech.onstart = () => {
      setIsSpeaking(true);
    };

    speech.onend = () => {
      setIsSpeaking(false);
    };

    speech.onerror = () => {
      setIsSpeaking(false);
    };

    setTimeout(() => {
      window.speechSynthesis.speak(speech);
    }, 100);
  };

  const isSimpleQuery = (query) => {
    const simpleQueryPatterns = [
      /^hi+\s*$/i,
      /^hello+\s*$/i,
      /^hey+\s*$/i,
      /^how are you/i,
      /^what's up/i,
      /^good morning/i,
      /^good afternoon/i,
      /^good evening/i,
      /^thanks/i,
      /^thank you/i,
      /^bye/i,
      /^goodbye/i,
      /^see you/i,
    ];
    
    return simpleQueryPatterns.some(pattern => pattern.test(query.trim()));
  };

  const sendMessage = async (transcriptText, isVoiceInput = false, isSuggestion = false) => {
    const messageText = transcriptText || input;
    if (!messageText.trim()) return;

    try {
      setIsLoading(true);
      
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }

      const userMessage = { sender: "user", text: messageText };
      setMessages(prev => [...prev, userMessage]);
      
      // Clear input immediately for better UX, regardless of source
      setInput("");
      
      setIsThinking(true);
      
      const simple = isSimpleQuery(messageText);

      const response = await fetch("https://healthify-bot-rag.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: messageText, simple }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      
      if (data.detectedLanguage) {
        setDetectedLanguage(data.detectedLanguage);
      }
      
      // Store the sentiment data from the response
      if (data.sentiment) {
        setMessageSentiments(prev => ({
          ...prev,
          [data.sessionId + '-' + Date.now()]: data.sentiment
        }));
      }
      
      // Remove the setTimeout to make the thinking animation stop immediately when response is received
      setIsThinking(false);
      
      const botMessage = { 
        sender: "bot", 
        text: data.reply || "Sorry, I couldn't generate a response.",
        sentiment: data.sentiment // Store sentiment with message
      };
      setMessages(prev => [...prev, botMessage]);
      
      if (data.sessionId) {
        setActiveSessionId(data.sessionId);
      }
      
      if (isVoiceMode || isVoiceInput) {
        setTimeout(() => textToSpeech(data.reply), 100);
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      setIsThinking(false);
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: "I'm having trouble connecting to my knowledge base. Please try again in a moment." 
      }]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        sendMessage();
      }
    }
  };

  const handleSendClick = () => {
    if (!isLoading && input.trim()) {
      sendMessage();
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
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isThinking]);

  const clearChat = async () => {
    if (messages.length === 0) return;

    try {
      await fetch("https://healthify-bot-rag.onrender.com/archive-session", {
        method: "POST",
      });
      
      const response = await fetch("https://healthify-bot-rag.onrender.com/clear-session", {
        method: "POST",
      });
      
      if (response.ok) {
        setMessages([]);
        setActiveSessionId(null);
      }
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  };

  const clearHistory = async () => {
    try {
      const response = await fetch("https://healthify-bot-rag.onrender.com/history", {
        method: "DELETE",
      });
      
      if (response.ok) {
        setChatHistory([]);
      }
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    setSelectedChat(null);
    
    if (!showHistory) {
      fetchChatHistory();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 1) return 'Less than a minute';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes > 0 ? `${remainingMinutes} min` : ''}`;
  };

  const viewChatSession = (index) => {
    try {
      if (index < 0 || index >= chatHistory.length) {
        return;
      }

      const session = chatHistory[index];
      console.log("Viewing chat session:", session);

      setSelectedChat(index);
    
      const sessionMessages = [];
      
      if (session.messages && session.messages.length > 0) {
        session.messages.forEach(msg => {
          if (msg.query) sessionMessages.push({ sender: "user", text: msg.query });
          if (msg.answer) sessionMessages.push({ sender: "bot", text: msg.answer });
        });
      } else {
        sessionMessages.push(
          { sender: "user", text: session.query || "Unnamed Session" },
          { sender: "bot", text: session.answer || "No response" }
        );
      }

      setMessages(sessionMessages.length > 0 ? sessionMessages : [
        { sender: "bot", text: "No conversation history available" }
      ]);
    } catch (error) {
      console.error("Error viewing chat session:", error);
      setMessages([]);
    }
  };

  const renderContent = (text) => {
    if (!text) return null;
    
    try {
      // Pre-process text to normalize bullet points
      let processedText = text
        // Handle various bullet point formats
        .replace(/^[-*•] (.+?)$/gm, '• $1')
        .replace(/^(\d+)\. (.+?)$/gm, '$1) $2');
      
      const formattedText = processedText
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/## (.+?)(\n|$)/g, '<h2>$1</h2>')
        // Improved bullet point handling with global multiline flag
        .replace(/^• (.+?)$/gm, '<li>$1</li>')
        .split('\n')
        .map((line, i) => {
          if (line.includes('<h2>')) {
            return `<h2 class="text-xl font-semibold text-emerald-400 mt-6 mb-3">${line.replace(/<\/?h2>/g, '')}</h2>`;
          }
          if (line.includes('<li>')) {
            return `<div class="flex items-start gap-2 mb-2"><span class="text-emerald-500 mt-1.5">•</span><span class="flex-1">${line.replace(/<\/?li>/g, '')}</span></div>`;
          }
          // Handle numbered lists
          if (/^\d+\)/.test(line)) {
            const [num, ...rest] = line.split(') ');
            return `<div class="flex items-start gap-2 mb-2"><span class="text-emerald-500 mt-1 min-w-[20px]">${num})</span><span class="flex-1">${rest.join(') ')}</span></div>`;
          }
          if (line.trim()) {
            return `<p class="mb-3">${line}</p>`;
          }
          return '';
        })
        .join('');
      
      return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
    } catch (error) {
      console.error("Error rendering content:", error);
      return <div className="whitespace-pre-wrap">{text}</div>;
    }
  };

  // Helper function to get sentiment icon
  const getSentimentIcon = (sentiment) => {
    if (!sentiment) return null;
    
    if (sentiment.includes('positive')) {
      return <Smile size={16} className="text-green-400" />;
    } else if (sentiment.includes('negative')) {
      return <Frown size={16} className="text-red-400" />;
    } else {
      return <Meh size={16} className="text-yellow-400" />;
    }
  };

  // Add this to display sentiment description
  const getSentimentDescription = (sentiment) => {
    if (!sentiment) return "";
    
    if (sentiment.includes('positive')) {
      return "Positive tone";
    } else if (sentiment.includes('negative')) {
      return "Negative tone";
    } else if (sentiment.includes('neutral')) {
      return "Neutral tone";
    } else {
      return sentiment;
    }
  };

  const renderBotMessage = (msg, index) => {
    const shouldShowGameSuggestions = msg.text.toLowerCase().includes("stress") || 
                                      msg.text.toLowerCase().includes("relax") || 
                                      msg.text.toLowerCase().includes("anxiety") ||
                                      msg.text.toLowerCase().includes("calm") ||
                                      msg.text.toLowerCase().includes("mind") ||
                                      Math.random() < 0.3; // 30% chance to show games for other messages

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start gap-3 max-w-[85%]"
      >
        <div className="bg-gray-800/70 rounded-2xl px-6 py-4 border border-gray-700/50 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-emerald-600/20 p-2 rounded-full">
              <Bot size={20} className="text-emerald-500" />
            </span>
            <h2 className="font-medium text-emerald-400">Healthify AI</h2>
            {detectedLanguage !== "en" && (
              <span className="flex items-center text-xs bg-emerald-900/60 text-emerald-400 px-2 py-1 rounded-full border border-emerald-700/50">
                <Globe size={12} className="mr-1" />
                {detectedLanguage === "ta-en" ? "தமிழ்-English" : 
                 detectedLanguage === "hi-en" ? "हिंदी-English" : 
                 detectedLanguage}
              </span>
            )}
            
            {/* Display sentiment indicator if available */}
            {msg.sentiment && (
              <span className="flex items-center text-xs bg-gray-800/80 px-2 py-1 rounded-full border border-gray-700/50">
                {getSentimentIcon(msg.sentiment)}
                <span className="ml-1 text-gray-300">{getSentimentDescription(msg.sentiment)}</span>
              </span>
            )}
          </div>
          <div className="prose prose-invert text-gray-200 max-w-none">
            {renderContent(msg.text)}
          </div>
          
          {/* Game suggestions inside the bot message */}
          {shouldShowGameSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-3 border-t border-gray-700/50 pt-3"
            >
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-emerald-400 mb-1">Try these relaxation activities:</p>
                <div className="flex flex-wrap gap-2">
                  {gamesSuggestions.map((game, idx) => (
                    <Link 
                      key={idx} 
                      to={game.path}
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-sm border border-emerald-600/30 transition-all"
                    >
                      <span className="mr-1.5">{game.icon}</span>
                      {game.name}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <button
          onClick={() => textToSpeech(msg.text)}
          className={`p-2 rounded-full ${
            isSpeaking 
              ? 'bg-emerald-600 text-white' 
              : 'bg-gray-700/70 text-gray-300 hover:bg-gray-600'
          } transition-all border border-gray-600`}
          aria-label="Speak message"
        >
          <Volume2 size={16} />
        </button>
      </motion.div>
    );
  };

  const renderUserMessage = (msg) => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-emerald-600 text-white px-5 py-4 rounded-2xl shadow-md max-w-[85%] border border-emerald-500"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-emerald-700/50 p-2 rounded-full">
            <User size={16} className="text-white" />
          </span>
          <h2 className="font-medium text-white">You</h2>
        </div>
        <p>{msg.text}</p>
      </motion.div>
    );
  };

  const renderChatHistoryItem = (chat, index) => {
    const hasMultipleMessages = chat.messages && chat.messages.length > 1;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        key={index}
        className={`p-4 rounded-xl cursor-pointer transition-all ${
          selectedChat === index 
            ? 'bg-gray-700/80 border-2 border-emerald-500/50' 
            : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
        }`}
        onClick={() => viewChatSession(index)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 mr-2">
            <div className="font-medium text-emerald-400 truncate max-w-[70%] mb-1">
              {chat.query?.length > 60 ? chat.query.substring(0, 60) + '...' : chat.query || "Unnamed chat"}
            </div>
            <div className="text-xs text-gray-400 flex items-center space-x-2">
              <div className="flex items-center">
                <Clock size={12} className="mr-1" />
                {formatDate(chat.timestamp)}
              </div>
              {hasMultipleMessages && (
                <>
                  <span className="text-gray-500">•</span>
                  <div className="flex items-center">
                    <span className="mr-1">💬</span>
                    {chat.messages.length} messages
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-400 truncate">
          {chat.answer?.length > 80 
            ? chat.answer.substring(0, 80) + '...' 
            : chat.answer || "No response"}
        </div>
      </motion.div>
    );
  };

  const renderThinkingBubble = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 max-w-[85%]" // Match the positioning of bot messages
    >
      <div className="flex items-center gap-2 bg-gray-800/70 px-5 py-3 rounded-2xl border border-gray-700/50 shadow-md">
        <Loader2 size={20} className="text-emerald-500 animate-spin" />
        <span className="text-gray-300 font-medium">Thinking...</span>
      </div>
    </motion.div>
  );

  const handleSuggestionClick = (suggestion) => {
    try {
      // Set input and immediately call sendMessage
      setInput(suggestion);
      sendMessage(suggestion, false, true);
    } catch (error) {
      console.error("Error handling suggestion click:", error);
      setIsThinking(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-16 inset-x-0 bottom-0 flex items-center justify-center z-40 bg-black/90">
      {/* Dark background patterns */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute left-0 top-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgb(21,25,40)_0%,rgb(4,9,15)_90%)]"></div>
        <div className="absolute opacity-50 top-40 left-20 w-72 h-72 bg-emerald-900 rounded-full mix-blend-overlay filter blur-3xl"></div>
        <div className="absolute opacity-40 -bottom-10 right-20 w-80 h-80 bg-blue-900 rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-[95%] h-[90vh] mx-auto bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-lg flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950">
          <div className="flex items-center gap-3">
            {showHistory && (selectedChat !== null || showHistory) ? (
              <button
                onClick={() => {
                  if (selectedChat !== null) {
                    setSelectedChat(null);
                  } else {
                    setShowHistory(false);
                  }
                }}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
            ) : null}
            
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-emerald-500 to-green-500 p-2 rounded-lg">
                <Sparkles size={20} className="text-white" />
              </span>
              <h1 className="text-xl font-bold text-white">
                {showHistory && selectedChat === null ? "Chat History" : 
                 showHistory && selectedChat !== null ? "Conversation Details" : 
                 "Healthify AI"}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {showHistory ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-900">
            {isLoading && selectedChat === null ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center">
                  <Loader2 size={40} className="text-emerald-500 animate-spin mb-4" />
                  <p className="text-gray-400">Loading conversations...</p>
                </div>
              </div>
            ) : selectedChat === null ? (
              chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
                  <History size={64} className="mb-6 text-gray-600 opacity-70" strokeWidth={1.5} />
                  <p className="text-lg font-medium text-gray-400">No conversations yet</p>
                  <p className="text-sm text-gray-500 mt-2">Start a new chat to see your history</p>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={16} /> Start New Chat
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Your Conversations</h2>
                    <button
                      onClick={clearHistory}
                      className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-all text-sm font-medium border border-red-800/50"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <XCircle size={16} />
                      )}
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                    {chatHistory.map((chat, index) => renderChatHistoryItem(chat, index))}
                  </div>
                </div>
              )
            ) : (
              <div className="h-full overflow-y-auto space-y-6">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "bot" ? renderBotMessage(msg, index) : renderUserMessage(msg)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-900 scroll-smooth"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 py-20">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-emerald-600/20 p-3 rounded-full mb-4"
                >
                  <Bot size={32} className="text-emerald-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Healthify AI</h2>
                <p className="text-gray-400 max-w-md mb-6">
                  I'm your personal health assistant. Ask me anything about wellness, nutrition, or fitness!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
                  {[
                    "What are some healthy breakfast ideas?",
                    "How can I improve my sleep quality?",
                    "What's a good workout for beginners?",
                    "How much water should I drink daily?"
                  ].map((suggestion, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3 border border-gray-700 rounded-lg text-sm text-left hover:bg-gray-800 text-gray-300 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-2">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "bot" ? renderBotMessage(msg, index) : renderUserMessage(msg)}
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    {renderThinkingBubble()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Input Area - Only show when not viewing history */}
        {!showHistory && (
          <div className="p-4 border-t border-gray-800 bg-gray-950">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50 text-white placeholder-gray-500 transition-all pr-12 text-lg"
                  placeholder="Ask anything about health..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendClick}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg ${
                    isLoading || !input.trim() 
                      ? 'text-gray-600' 
                      : 'text-emerald-500 hover:bg-gray-700'
                  } transition-all`}
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? 
                    <Loader2 size={22} className="animate-spin" /> : 
                    <Send size={22} />
                  }
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={startVoiceRecognition}
                  className="p-4 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-emerald-500 hover:bg-gray-700 transition-all"
                  disabled={isLoading}
                  aria-label="Voice input"
                >
                  <Mic size={22} />
                </button>
                
                <button
                  onClick={toggleHistory}
                  className="p-4 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-emerald-500 hover:bg-gray-700 transition-all"
                  disabled={isLoading}
                  aria-label="Chat history"
                >
                  <History size={22} />
                </button>
                
                <button
                  onClick={clearChat}
                  className="p-4 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-red-500 hover:bg-gray-700 transition-all"
                  disabled={isLoading || messages.length === 0}
                  aria-label="Clear chat"
                >
                  <Trash2 size={22} />
                </button>
              </div>
              
            </div>
            
            {/* Language indicator */}
            {detectedLanguage !== "en" && (
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <Globe size={12} className="mr-1" />
                Language detected: 
                <span className="ml-1 text-emerald-500">
                  {detectedLanguage === "ta-en" ? "Tamil-English" : 
                   detectedLanguage === "hi-en" ? "Hindi-English" : 
                   detectedLanguage}
                </span>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Chatbot;