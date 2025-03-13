import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Mic, Send, Volume2, Trash2, History, ArrowLeft, Clock, XCircle, Loader2 } from "lucide-react";

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

  useEffect(() => {
    // Fetch chat history when component mounts
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      console.log("🔍 Attempting to fetch chat history...");
      
      const response = await fetch("http://localhost:5000/history", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      // Log the raw response for debugging
      console.log("Raw History Response:", response);
      
      if (!response.ok) {
        // More detailed error logging
        const errorText = await response.text();
        console.error(`❌ Failed to fetch history. Status: ${response.status}, Error: ${errorText}`);
        throw new Error(`Failed to fetch history. Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Log the parsed data for debugging
      console.log("📦 Parsed Chat History:", data);
      
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        console.log(`✅ Successfully fetched ${data.length} chat sessions`);
        setChatHistory(data);
      } else {
        console.error("❌ Received invalid chat history format:", data);
        setChatHistory([]);
      }
    } catch (error) {
      console.error("🚨 Comprehensive Error fetching chat history:", error);
      
      // Show an error message to the user
      alert(`Error fetching chat history: ${error.message}`);
      
      // Set to an empty array to prevent rendering errors
      setChatHistory([]);
    }
  };

  const textToSpeech = (text) => {
    if (!text) return;

    // Toggle speech off if already speaking
    if (window.speechSynthesis.speaking && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Advanced text cleaning for more natural speech
    const cleanText = text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/💚/g, '') // Remove emojis
      .replace(/💫/g, '')
      .replace(/\*\*/g, '') // Remove markdown bold markers
      .replace(/##/g, '') // Remove markdown headings
      .replace(/<break time="2s"\/>/g, '') // Remove any break tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Ensure space after punctuation
      .trim();

    // Create speech utterance with more natural parameters
    const speech = new SpeechSynthesisUtterance(cleanText);
    
    // More natural speech synthesis settings
    speech.lang = "en-US"; // Use a clear, standard American English voice
    speech.rate = 0.85; // Slightly slower than default for more natural pace
    speech.pitch = 1.1; // Slightly higher pitch for more engaging tone
    speech.volume = 0.9; // Slightly reduced volume for comfort

    // Add more natural pauses for longer texts
    const sentences = cleanText.split(/([.!?])\s+/);
    if (sentences.length > 3) {
      // For longer texts, add slight pauses between sentences
      speech.onboundary = (event) => {
        if (event.name === 'sentence') {
          // Introduce a small, natural-feeling pause
          window.speechSynthesis.pause();
          setTimeout(() => window.speechSynthesis.resume(), 200);
        }
      };
    }
    
    // Voice selection for more natural sound
    const voices = window.speechSynthesis.getVoices();
    const naturalVoices = voices.filter(voice => 
      voice.lang.startsWith('en-') && 
      (voice.name.includes('Samantha') || 
       voice.name.includes('Karen') || 
       voice.name.includes('Allison'))
    );

    // Select a natural-sounding voice if available
    if (naturalVoices.length > 0) {
      speech.voice = naturalVoices[0];
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

    // Speak with a slight delay for more natural start
    setTimeout(() => {
      window.speechSynthesis.speak(speech);
    }, 100);
  };

  const sendMessage = async (transcriptText, isVoiceInput = false) => {
    const messageText = transcriptText || input;
    if (!messageText.trim()) return;

    // Set loading state
    setIsLoading(true);

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

      // Refresh chat history after new message
      fetchChatHistory();

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
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid form submission
      
      // Only send if not already loading and input is not empty
      if (!isLoading && input.trim()) {
        sendMessage();
      }
    }
  };

  // Handle Send button click
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
      // Scroll to bottom with a smooth animation
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Also scroll to bottom when loading state changes
  useEffect(() => {
    if (!isLoading && chatContainerRef.current) {
      // Small delay to ensure the DOM has updated
      setTimeout(() => {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [isLoading]);

  // Add this function after other state declarations at the top
  const clearChat = () => {
    // If there are no messages, do nothing
    if (messages.length === 0) return;

    // Call the backend to save the current session and start a new one
    fetch("http://localhost:5000/clear-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        messages: messages.map(msg => ({
          query: msg.sender === "user" ? msg.text : null,
          answer: msg.sender === "bot" ? msg.text : null
        })).filter(msg => msg.query || msg.answer)
      })
    })
    .then(response => {
      if (response.ok) {
        // Clear the current messages
        setMessages([]);
        
        // Refresh chat history to show the newly saved session
        return fetchChatHistory();
      } else {
        console.error("Failed to clear session");
      }
    })
    .catch(error => {
      console.error("Error clearing session:", error);
    });
  };

  const clearHistory = async () => {
    try {
      const response = await fetch("http://localhost:5000/history", {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to clear history");
      
      setChatHistory([]);
      console.log("Chat history cleared");
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    setSelectedChat(null);
    
    // Refresh chat history when opening the history view
    if (!showHistory) {
      fetchChatHistory();
    }
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
      // Validate index
      if (index < 0 || index >= chatHistory.length) {
        console.error(`Invalid chat history index: ${index}`);
        return;
      }

      const session = chatHistory[index];
      
      // Log the session for debugging
      console.log("Viewing chat session:", session);

      // Validate session object
      if (!session) {
        console.error(`No session found at index ${index}`);
        return;
      }

      setSelectedChat(index);
    
      // Ensure we have a full conversation history
      const sessionMessages = session.messages ? 
        session.messages.flatMap(msg => [
          { sender: "user", text: msg.query || "No user message" },
          { sender: "bot", text: msg.answer || "No bot response" }
        ]) :
        [
          { sender: "user", text: session.query || "Unnamed Session" },
          { sender: "bot", text: session.answer || "No response" }
        ];
    
      // Log the generated messages
      console.log("Session messages:", sessionMessages);

      // Set messages, ensuring we always have something to display
      setMessages(sessionMessages.length > 0 ? sessionMessages : [
        { sender: "bot", text: "No conversation history available" }
      ]);
    
      // Set to show history view with selected session
      setShowHistory(true);
    } catch (error) {
      console.error("Error viewing chat session:", error);
      // Fallback to empty messages if something goes wrong
      setMessages([]);
      setShowHistory(true);
    }
  };

  // Modify the history rendering to include a way to go back to history list
  const renderChatHistoryItem = (chat, index) => {
    const hasMultipleMessages = chat.messages && chat.messages.length > 1;
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`p-4 rounded-xl cursor-pointer transition-all group ${
          selectedChat === index 
            ? 'bg-indigo-100 border-2 border-indigo-300' 
            : 'bg-white hover:bg-indigo-50 border border-gray-200'
        }`}
        onClick={() => viewChatSession(index)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 mr-2">
            <div className="font-medium text-indigo-700 truncate max-w-[70%] mb-1">
              {chat.query.length > 60 ? chat.query.substring(0, 60) + '...' : chat.query}
            </div>
            <div className="text-xs text-gray-500 flex items-center space-x-2">
              <div className="flex items-center">
                <Clock size={12} className="mr-1" />
                {formatDate(chat.timestamp)}
              </div>
              {hasMultipleMessages && (
                <>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center">
                    <span className="mr-1">💬</span>
                    {chat.messages.length} messages
                  </div>
                  {chat.duration > 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center">
                        <span className="mr-1">⏱️</span>
                        {formatDuration(chat.duration)}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-indigo-600"
          >
            <ArrowLeft size={20} />
          </motion.div>
        </div>
        <div className="text-sm text-gray-600 truncate">
          {chat.answer.replace(/<[^>]*>/g, '').length > 80 
            ? chat.answer.replace(/<[^>]*>/g, '').substring(0, 80) + '...' 
            : chat.answer.replace(/<[^>]*>/g, '')}
        </div>
      </motion.div>
    );
  };

  const renderMarkdownContent = (text) => {
    // First, check if the text is in the format of the example message
    if (text.includes("Quick Take") && text.includes("Friendly Advice") && text.includes("Wellness Tips")) {
      // Handle the specific format from the example
      const sections = text.split(/(?=## )/);
      
      return sections.map((section, index) => {
        if (!section.trim()) return null;
        
        const [heading, ...contentParts] = section.split('\n');
        const content = contentParts.join('\n');
        
        return (
          <div key={index} className="mb-4">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-indigo-700 mt-4 mb-3"
            >
              {heading.replace(/^## /, '')}
            </motion.h2>
            
            {content.split('\n').map((line, lineIndex) => {
              // Handle bullet points
              if (line.trim().startsWith('•') || line.trim().startsWith('*')) {
                return (
                  <motion.div
                    key={`bullet-${lineIndex}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 ml-2 mb-2"
                  >
                    <span className="text-indigo-600 text-xl">•</span>
                    <span className="flex-1">
                      {renderBoldText(line.replace(/^[•*]\s+/, ''))}
                    </span>
                  </motion.div>
                );
              }
              
              // Handle numbered points (like "1.", "2.", etc.)
              if (line.trim().match(/^\d+\.\s+/)) {
                return (
                  <motion.div
                    key={`number-${lineIndex}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 ml-2 mb-2"
                  >
                    <span className="text-indigo-600 font-bold">{line.match(/^\d+\./)[0]}</span>
                    <span className="flex-1">
                      {renderBoldText(line.replace(/^\d+\.\s+/, ''))}
                    </span>
                  </motion.div>
                );
              }
              
              // Regular paragraph text
              if (line.trim()) {
                return (
                  <motion.p
                    key={`text-${lineIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-3 leading-relaxed"
                  >
                    {renderBoldText(line)}
                  </motion.p>
                );
              }
              
              return null;
            })}
          </div>
        );
      });
    }
    
    // If not in the specific format, use the existing logic
    // Clean up the text for rendering
    const cleanText = text
      .replace(/&nbsp;/g, ' ') // Replace HTML spaces
      .replace(/\n{3,}/g, '\n\n'); // Normalize multiple line breaks

    // Split the content by sections (headings, paragraphs, bullet points)
    const sections = [];
    let currentSection = '';
    
    // Process the text line by line
    cleanText.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if this is a heading
      if (trimmedLine.startsWith('## ')) {
        // If we have content in the current section, add it
        if (currentSection.trim()) {
          sections.push(currentSection);
        }
        // Start a new section with the heading
        currentSection = trimmedLine;
      } 
      // Check if this is a bullet point
      else if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('* ')) {
        // If the current section doesn't already have bullet points, add a line break
        if (currentSection && !currentSection.includes('• ') && !currentSection.includes('* ')) {
          currentSection += '\n' + trimmedLine;
        } else {
          currentSection += '\n' + trimmedLine;
        }
      } 
      // Regular text
      else {
        // If this is the start of a new paragraph
        if (trimmedLine === '') {
          currentSection += '\n\n';
        } else {
          // Add to the current section
          if (currentSection) {
            currentSection += ' ' + trimmedLine;
          } else {
            currentSection = trimmedLine;
          }
        }
      }
    });
    
    // Add the last section if it has content
    if (currentSection.trim()) {
      sections.push(currentSection);
    }
    
    // Render each section
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      
      // Heading
      if (trimmedSection.startsWith('## ')) {
        return (
          <motion.h2
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold text-indigo-700 mt-4 mb-3"
          >
            {trimmedSection.replace('## ', '')}
          </motion.h2>
        );
      }
      
      // Section with bullet points
      else if (trimmedSection.includes('• ') || trimmedSection.includes('* ')) {
        const lines = trimmedSection.split('\n');
        const paragraphText = lines[0].trim();
        const bulletPoints = lines.slice(1).filter(line => line.trim().startsWith('• ') || line.trim().startsWith('* '));
        
        return (
          <div key={index}>
            {paragraphText && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-3 leading-relaxed"
              >
                {renderBoldText(paragraphText)}
              </motion.p>
            )}
            {bulletPoints.map((point, bulletIndex) => (
              <motion.div
                key={`${index}-${bulletIndex}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 ml-2 mb-2"
              >
                <span className="text-indigo-600 text-xl">•</span>
                <span className="flex-1">{renderBoldText(point.replace(/^[•*]\s+/, ''))}</span>
              </motion.div>
            ))}
          </div>
        );
      }
      
      // Regular paragraph
      else {
        return (
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 leading-relaxed"
          >
            {renderBoldText(trimmedSection)}
          </motion.p>
        );
      }
    });
  };

  // Helper function to render bold text
  const renderBoldText = (text) => {
    const parts = [];
    let lastIndex = 0;
    let boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold part
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      
      // Add the bold part
      parts.push({
        type: 'bold',
        content: match[1]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }
    
    return parts.length > 0 ? parts.map((part, partIndex) => (
      part.type === 'bold' ? (
        <strong key={partIndex} className="font-bold text-indigo-600">{part.content}</strong>
      ) : (
        <span key={partIndex}>{part.content}</span>
      )
    )) : text;
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
        className="relative w-full h-[90vh] mx-auto p-4 sm:p-6 bg-white/90 shadow-2xl rounded-3xl backdrop-blur-lg border-2 border-white/30 flex flex-col overflow-hidden"
      >
        {/* Chatbot Header */}
        <div className="text-center text-indigo-800 text-2xl sm:text-3xl font-extrabold pb-4 border-b-2 border-indigo-200 flex items-center justify-center relative">
          {showHistory && selectedChat !== null && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                // Go back to the full history list
                setSelectedChat(null);
              }}
              className="absolute left-4 text-indigo-700 hover:text-indigo-900 transition-all"
            >
              <ArrowLeft size={28} strokeWidth={2.5} />
            </motion.button>
          )}
          {showHistory && selectedChat === null && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                // Return to the main chatbot interface
                setShowHistory(false);
                setSelectedChat(null);
              }}
              className="absolute left-4 text-indigo-700 hover:text-indigo-900 transition-all"
            >
              <ArrowLeft size={28} strokeWidth={2.5} />
            </motion.button>
          )}
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            {showHistory && selectedChat === null ? "Chat History" : 
             showHistory && selectedChat !== null ? "Conversation Details" : 
             "Healthify AI Chatbot"}
          </motion.span>
        </div>

        {/* Messages Box or History View */}
        {showHistory ? (
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 mt-2 sm:mt-4 bg-gradient-to-br from-white/60 via-indigo-50/30 to-white/40 border-2 border-indigo-100 rounded-2xl shadow-inner">
            {selectedChat === null ? (
              // Full history list
              chatHistory.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-gray-500"
                >
                  <History size={64} className="mb-6 text-indigo-400 opacity-70" strokeWidth={1.5} />
                  <p className="text-lg font-medium text-indigo-600">No conversations yet</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-indigo-800 tracking-tight">Your Conversations</h3>
                    <motion.button
                      whileHover={{ scale: 1.05, rotate: 3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearHistory}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all text-sm font-semibold border border-red-200 shadow-sm"
                    >
                      <XCircle size={16} strokeWidth={2} />
                      Clear All
                    </motion.button>
                  </div>
                  {chatHistory.map((chat, index) => renderChatHistoryItem(chat, index))}
                </div>
              )
            ) : (
              // Specific chat session view
              <div className="h-full overflow-y-auto">
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
                      } mb-4 sm:mb-5`}
                    >
                      {msg.sender === "bot" ? (
                        <div className="flex items-start gap-3">
                          <motion.div
                            whileHover={{ scale: 1.02, rotate: 1 }}
                            className="message-section bg-white rounded-2xl px-5 py-4 shadow-lg border border-indigo-100/50 hover:shadow-xl transition-all"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <span role="img" aria-label="robot" className="text-2xl">🤖</span>
                              <h2 className="font-bold text-lg text-indigo-800 tracking-tight">Healthify AI</h2>
                            </div>
                            <div className="prose prose-indigo max-w-none">
                              {renderMarkdownContent(msg.text)}
                            </div>
                          </motion.div>
                          <motion.button
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => textToSpeech(msg.text)}
                            className={`p-2.5 rounded-full bg-indigo-50 border border-indigo-100 ${
                              isSpeaking 
                                ? 'text-indigo-900 bg-indigo-200' 
                                : 'text-indigo-600 hover:bg-indigo-100'
                            } transition-all shadow-sm`}
                          >
                            <Volume2 size={20} strokeWidth={2} />
                          </motion.button>
                        </div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.02, rotate: 1 }}
                          className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white px-5 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                        >
                          {msg.text}
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 sm:p-6 mt-2 sm:mt-4 bg-gradient-to-br from-white/60 via-indigo-50/30 to-white/40 border-2 border-indigo-100 rounded-2xl shadow-inner"
            style={{
              backgroundImage: "url('data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E')"
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
                  } mb-4 sm:mb-5`}
                >
                  {msg.sender === "bot" ? (
                    <div className="flex items-start gap-3">
                      <motion.div
                        whileHover={{ scale: 1.02, rotate: 1 }}
                        className="message-section bg-white rounded-2xl px-5 py-4 shadow-lg border border-indigo-100/50 hover:shadow-xl transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span role="img" aria-label="robot" className="text-2xl">🤖</span>
                          <h2 className="font-bold text-lg text-indigo-800 tracking-tight">Healthify AI</h2>
                        </div>
                        <div className="prose prose-indigo max-w-none">
                          {renderMarkdownContent(msg.text)}
                        </div>
                      </motion.div>
                      <motion.button
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => textToSpeech(msg.text)}
                        className={`p-2.5 rounded-full bg-indigo-50 border border-indigo-100 ${
                          isSpeaking 
                            ? 'text-indigo-900 bg-indigo-200' 
                            : 'text-indigo-600 hover:bg-indigo-100'
                        } transition-all shadow-sm`}
                      >
                        <Volume2 size={20} strokeWidth={2} />
                      </motion.button>
                    </div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.02, rotate: 1 }}
                      className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white px-5 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {msg.text}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Input and Buttons - Only render when not in history view */}
        {!showHistory && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex mt-3 sm:mt-5 gap-3 sm:gap-4"
          >
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              className="flex-1 px-5 py-3 border-2 border-indigo-300 rounded-full outline-none focus:ring-4 focus:ring-indigo-200 text-base sm:text-lg transition-all bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={showHistory || isLoading}
            />
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleHistory}
              className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white p-3.5 sm:p-4 rounded-full hover:opacity-90 transition-all flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer border-2 border-white/20"
              disabled={isLoading}
            >
              <History size={22} className="text-white" strokeWidth={2.5} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearChat}
              className="bg-gradient-to-br from-purple-500 via-red-500 to-pink-500 text-white p-3.5 sm:p-4 rounded-full hover:opacity-90 transition-all flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer border-2 border-white/20"
              disabled={showHistory || isLoading}
            >
              <Trash2 size={22} strokeWidth={2.5} />
            </motion.button>

            {!showHistory && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={startVoiceRecognition}
                  className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-white p-3.5 sm:p-4 rounded-full hover:opacity-90 transition-all flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer border-2 border-white/20"
                  disabled={isLoading}
                >
                  <Mic size={22} strokeWidth={2.5} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendClick}
                  className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-3.5 sm:p-4 rounded-full hover:opacity-90 transition-all flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer border-2 border-white/20"
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? <Loader2 size={22} className="animate-spin" strokeWidth={2.5} /> : <Send size={22} strokeWidth={2.5} />}
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Chatbot;
