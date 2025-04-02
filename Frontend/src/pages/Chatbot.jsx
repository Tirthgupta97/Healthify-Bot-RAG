import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Mic, Send, Volume2, Trash2, History, ArrowLeft, Clock, XCircle, Loader2, Globe } from "lucide-react";
import { API_BASE_URL, apiRequest } from "../config/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

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
  const [language, setLanguage] = useState("en"); // Default language
  const [gameRecommendations, setGameRecommendations] = useState([]);
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Verify token is valid
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        // Token expired
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsVoiceMode(true);
        setTimeout(async () => {
          await sendMessage(transcript, true);
        }, 100);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsVoiceMode(false);
      };

      recognitionInstance.onend = () => {
        setIsVoiceMode(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.error("Speech recognition not supported");
    }
  }, []);

  // Fetch active session on component mount
  useEffect(() => {
    fetchActiveSession();
    // Only fetch history if we're showing it
    if (showHistory) {
      fetchChatHistory();
    }
  }, [showHistory]);

  // Fetch active session when returning from history view
  const fetchActiveSession = async () => {
    try {
      const response = await apiRequest("/active-session");

      if (!response || !response.ok) {
        console.error(`Failed to fetch active session. Status: ${response?.status}`);
        return;
      }

      const sessionData = await response.json();

      // Only update if there's an active session with messages
      if (sessionData && sessionData.messages && sessionData.messages.length > 0) {
        console.log("✅ Active session loaded:", sessionData.id);

        // Create message array from session data
        const sessionMessages = [];

        sessionData.messages.forEach((msg) => {
          if (msg.query) sessionMessages.push({ sender: "user", text: msg.query });
          if (msg.answer)
            sessionMessages.push({
              sender: "bot",
              text: msg.answer,
              gameRecommendations: msg.gameRecommendations || [],
            });
        });

        setMessages(sessionMessages);
        setActiveSessionId(sessionData.id);
      } else {
        // If no active session, ensure messages are cleared
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

      const response = await apiRequest("/history");

      if (!response || !response.ok) {
        throw new Error(`Failed to fetch history. Status: ${response?.status}`);
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

    // Toggle speech off if already speaking
    if (window.speechSynthesis.speaking && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean text for speech
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/##/g, "")
      .replace(/[💚💫✨🌟🤗💪]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const speech = new SpeechSynthesisUtterance(cleanText);
    speech.lang = language; // Use selected language
    speech.rate = 0.9;
    speech.pitch = 1.05;

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

  // Determine if this is a simple query that should have a shorter response
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

    return simpleQueryPatterns.some((pattern) => pattern.test(query.trim()));
  };

  // Update the sendMessage function
  const sendMessage = async (transcriptText, isVoiceInput = false) => {
    const messageText = transcriptText || input;
    if (!messageText.trim()) return;

    try {
      // Set loading and thinking states
      setIsLoading(true);

      // Cancel ongoing speech if any
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }

      // Add user message immediately
      const userMessage = { sender: "user", text: messageText };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      // Add a thinking message
      setIsThinking(true);

      // Check if this is a simple greeting
      const isSimple = isSimpleQuery(messageText);

      // Send request to backend
      const response = await apiRequest("/chat", {
        method: "POST",
        body: JSON.stringify({
          query: messageText,
          isSimple: isSimple,
          language: language,
        }),
      });

      if (!response || !response.ok) throw new Error(`Server error: ${response?.status}`);

      const data = await response.json();

      // Add a slight delay for UX
      setTimeout(() => {
        setIsThinking(false);

        // Add bot response
        const botMessage = {
          sender: "bot",
          text: data.reply || "Sorry, I couldn't generate a response.",
          gameRecommendations: data.gameRecommendations || [],
        };

        setMessages((prev) => [...prev, botMessage]);

        // Store game recommendations separately
        if (data.gameRecommendations?.length > 0) {
          setGameRecommendations(data.gameRecommendations);
        }

        // Update session ID if available
        if (data.sessionId) {
          setActiveSessionId(data.sessionId);
        }

        // Speak response if in voice mode
        if (isVoiceMode || isVoiceInput) {
          setTimeout(() => textToSpeech(data.reply), 100);
        }

        setIsLoading(false);
      }, isSimple ? 500 : 800);
    } catch (error) {
      console.error("Error sending message:", error);

      // Handle errors gracefully
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I'm having trouble connecting to my knowledge base. Please try again in a moment.",
        },
      ]);
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
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
      console.error("Speech recognition not initialized");
    }
  };

  // Change language handler
  const changeLanguage = (newLang) => {
    setLanguage(newLang);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isThinking]);

  // Archive current session before clearing
  const clearChat = async () => {
    if (messages.length === 0) return;

    try {
      await apiRequest("/archive-session", {
        method: "POST",
      });

      const response = await apiRequest("/clear-session", {
        method: "POST",
      });

      if (response && response.ok) {
        setMessages([]);
        setActiveSessionId(null);
        setGameRecommendations([]);
      }
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  };

  const clearHistory = async () => {
    try {
      const response = await apiRequest("/history", {
        method: "DELETE",
      });

      if (response && response.ok) {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 1) return "Less than a minute";
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours !== 1 ? "s" : ""} ${remainingMinutes > 0 ? `${remainingMinutes} min` : ""}`;
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
        session.messages.forEach((msg) => {
          if (msg.query) sessionMessages.push({ sender: "user", text: msg.query });
          if (msg.answer)
            sessionMessages.push({
              sender: "bot",
              text: msg.answer,
              gameRecommendations: msg.gameRecommendations || [],
            });
        });
      } else {
        sessionMessages.push(
          { sender: "user", text: session.query || "Unnamed Session" },
          {
            sender: "bot",
            text: session.answer || "No response",
            gameRecommendations: session.gameRecommendations || [],
          }
        );
      }

      setMessages(
        sessionMessages.length > 0
          ? sessionMessages
          : [{ sender: "bot", text: "No conversation history available" }]
      );
    } catch (error) {
      console.error("Error viewing chat session:", error);
      setMessages([]);
    }
  };

  // Render game recommendations
  const renderGameRecommendations = (games) => {
    if (!games || games.length === 0) return null;

    return (
      <div className="mt-4 pt-4 border-t border-indigo-100">
        <h4 className="text-md font-semibold text-indigo-700 mb-3">Game Recommendations:</h4>
        <div className="flex flex-wrap gap-3">
          {games.map((game, index) => (
            <a
              key={index}
              href={game.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium transition-all"
            >
              🎮 {game.title}
            </a>
          ))}
        </div>
      </div>
    );
  };

  // Simple function to render markdown-like content
  const renderContent = (text, gameRecs) => {
    if (!text) return null;

    try {
      // Simple formatting
      const formattedText = text
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/## (.+?)(\n|$)/g, "<h2>$1</h2>")
        .replace(/• (.+?)(\n|$)/g, "<li>$1</li>")
        .split("\n")
        .map((line, i) => {
          if (line.includes("<h2>")) {
            return `<h2 class="text-xl font-semibold text-indigo-700 mt-6 mb-3">${line.replace(/<\/?h2>/g, "")}</h2>`;
          }
          if (line.includes("<li>")) {
            return `<div class="flex items-start gap-2 mb-2"><span class="text-indigo-600 mt-1">•</span><span>${line.replace(
              /<\/?li>/g,
              ""
            )}</span></div>`;
          }
          if (line.trim()) {
            return `<p class="mb-3">${line}</p>`;
          }
          return "";
        })
        .join("");

      return (
        <>
          <div dangerouslySetInnerHTML={{ __html: formattedText }} />
          {gameRecs && renderGameRecommendations(gameRecs)}
        </>
      );
    } catch (error) {
      console.error("Error rendering content:", error);
      return <div className="whitespace-pre-wrap">{text}</div>;
    }
  };

  const renderChatHistoryItem = (chat, index) => {
    const hasMultipleMessages = chat.messages && chat.messages.length > 1;

    return (
      <div
        key={index}
        className={`p-4 rounded-xl cursor-pointer transition-all group ${
          selectedChat === index
            ? "bg-indigo-100 border-2 border-indigo-300"
            : "bg-white hover:bg-indigo-50 border border-gray-200"
        }`}
        onClick={() => viewChatSession(index)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 mr-2">
            <div className="font-medium text-indigo-700 truncate max-w-[70%] mb-1">
              {chat.query?.length > 60 ? chat.query.substring(0, 60) + "..." : chat.query || "Unnamed chat"}
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
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600 truncate">
          {chat.answer?.length > 80 ? chat.answer.substring(0, 80) + "..." : chat.answer || "No response"}
        </div>
      </div>
    );
  };

  // Language selector dropdown
  const renderLanguageSelector = () => {
    const languages = [
      { code: "en", name: "English" },
      { code: "es", name: "Spanish" },
      { code: "fr", name: "French" },
      { code: "hi", name: "Hindi" },
      { code: "ta", name: "Tamil" },
    ];

    return (
      <div className="absolute right-6 top-6 z-10">
        <div className="relative">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white rounded-full text-indigo-600 text-sm font-medium border border-indigo-200 shadow-sm"
            onClick={() => document.getElementById("langDropdown").classList.toggle("hidden")}
          >
            <Globe size={16} />
            {languages.find((l) => l.code === language)?.name || "English"}
          </button>

          <div
            id="langDropdown"
            className="hidden absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 z-50"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${
                  language === lang.code ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700"
                }`}
                onClick={() => {
                  changeLanguage(lang.code);
                  document.getElementById("langDropdown").classList.add("hidden");
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-100 to-white px-4 sm:px-8 overflow-hidden mt-16">
      {/* Background Animation Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 -top-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute -bottom-10 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
      </div>

      {/* Language selector */}
      {renderLanguageSelector()}

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="absolute top-6 left-6 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors border border-red-200"
      >
        Logout
      </button>

      {/* Chatbot Container */}
      <div className="relative w-full h-[90vh] mx-auto p-4 sm:p-6 bg-white/90 shadow-2xl rounded-3xl backdrop-blur-lg border-2 border-white/30 flex flex-col overflow-hidden">
        {/* Chatbot Header */}
        <div className="text-center text-indigo-800 text-2xl sm:text-3xl font-extrabold pb-4 border-b-2 border-indigo-200 flex items-center justify-center relative">
          {showHistory && selectedChat !== null && (
            <button
              onClick={() => {
                setSelectedChat(null);
              }}
              className="absolute left-4 text-indigo-700 hover:text-indigo-900 transition-all"
            >
              <ArrowLeft size={28} strokeWidth={2.5} />
            </button>
          )}
          {showHistory && selectedChat === null && (
            <button
              onClick={() => {
                setShowHistory(false);
                setSelectedChat(null);
              }}
              className="absolute left-4 text-indigo-700 hover:text-indigo-900 transition-all"
            >
              <ArrowLeft size={28} strokeWidth={2.5} />
            </button>
          )}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            {showHistory && selectedChat === null
              ? "Chat History"
              : showHistory && selectedChat !== null
              ? "Conversation Details"
              : "Healthify AI Chatbot"}
          </span>
        </div>

        {/* Messages Box or History View */}
        {showHistory ? (
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 mt-2 sm:mt-4 bg-gradient-to-br from-white/60 via-indigo-50/30 to-white/40 border-2 border-indigo-100 rounded-2xl shadow-inner">
            {selectedChat === null ? (
              // Full history list
              chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <History size={64} className="mb-6 text-indigo-400 opacity-70" strokeWidth={1.5} />
                  <p className="text-lg font-medium text-indigo-600">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-indigo-800 tracking-tight">Your Conversations</h3>
                    <button
                      onClick={clearHistory}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all text-sm font-semibold border border-red-200 shadow-sm"
                    >
                      <XCircle size={16} strokeWidth={2} />
                      Clear All
                    </button>
                  </div>
                  {chatHistory.map((chat, index) => renderChatHistoryItem(chat, index))}
                </div>
              )
            ) : (
              // Specific chat session view
              <div className="h-full overflow-y-auto">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-center ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    } mb-4 sm:mb-5`}
                  >
                    {msg.sender === "bot" ? (
                      <div className="flex items-start gap-3">
                        <div className="message-section bg-white rounded-2xl px-5 py-4 shadow-lg border border-indigo-100/50 hover:shadow-xl transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <span role="img" aria-label="robot" className="text-2xl">
                              🤖
                            </span>
                            <h2 className="font-bold text-lg text-indigo-800 tracking-tight">Healthify AI</h2>
                          </div>
                          <div className="prose prose-indigo max-w-none">
                            {renderContent(msg.text, msg.gameRecommendations)}
                          </div>
                        </div>
                        <button
                          onClick={() => textToSpeech(msg.text)}
                          className={`p-2.5 rounded-full bg-indigo-50 border border-indigo-100 ${
                            isSpeaking
                              ? "text-indigo-900 bg-indigo-200"
                              : "text-indigo-600 hover:bg-indigo-100"
                          } transition-all shadow-sm`}
                        >
                          <Volume2 size={20} strokeWidth={2} />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white px-5 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 sm:p-6 mt-2 sm:mt-4 bg-gradient-to-br from-white/60 via-indigo-50/30 to-white/40 border-2 border-indigo-100 rounded-2xl shadow-inner"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } mb-4 sm:mb-5`}
              >
                {msg.sender === "bot" ? (
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="message-section bg-white rounded-2xl px-5 py-4 shadow-lg border border-indigo-100/50 hover:shadow-xl transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <span role="img" aria-label="robot" className="text-2xl">
                          🤖
                        </span>
                        <h2 className="font-bold text-lg text-indigo-800 tracking-tight">Healthify AI</h2>
                      </div>
                      {isThinking && index === messages.length - 1 ? (
                        <div className="flex items-center gap-2 text-indigo-600">
                          <span>Thinking</span>
                          <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"
                                style={{ animationDelay: `${i * 0.15}s` }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="prose prose-indigo max-w-none">
                          {renderContent(msg.text, msg.gameRecommendations)}
                        </div>
                      )}
                    </div>
                    {!(isThinking && index === messages.length - 1) && (
                      <button
                        onClick={() => textToSpeech(msg.text)}
                        className={`p-2.5 rounded-full bg-indigo-50 border border-indigo-100 ${
                          isSpeaking
                            ? "text-indigo-900 bg-indigo-200"
                            : "text-indigo-600 hover:bg-indigo-100"
                        } transition-all shadow-sm`}
                      >
                        <Volume2 size={20} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white px-5 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Input and Buttons - Only render when not in history view */}
        {!showHistory && (
          <div className="flex mt-3 sm:mt-5 gap-3 sm:gap-4">
            <input
              type="text"
              className="flex-1 px-5 py-3 border-2 border-indigo-300 rounded-full outline-none focus:ring-4 focus:ring-indigo-200 text-base sm:text-lg transition-all bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={showHistory || isLoading}
            />

            <button
              onClick={toggleHistory}
              className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white p-3.5 sm:p-4 rounded-full hover:opacity-90 transition-all flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer border-2 border-white/20"
              disabled={isLoading}
            >
              <History size={22} className="text-white" strokeWidth={2.5} />
            </button>

            <button
              onClick={clearChat}
              className="bg-gradient-to-br from-purple-500 via-red-500 to-pink-500 text-white p-3.5 sm:p-4 rounded-full hover:opacity-90 transition-all flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer border-2 border-white/20"
              disabled={showHistory || isLoading}
            >
              <Trash2 size={22} strokeWidth={2.5} />
            </button>

            <button
              onClick={startVoiceRecognition}
              className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-white p-3.5 sm:p-4 rounded-full hover:opacity-90 transition-all flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer border-2 border-white/20"
              disabled={isLoading}
            >
              <Mic size={22} strokeWidth={2.5} />
            </button>

            <button
              onClick={handleSendClick}
              className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-3.5 sm:p-4 rounded-full hover:opacity-90 transition-all flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer border-2 border-white/20"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 size={22} className="animate-spin" strokeWidth={2.5} />
              ) : (
                <Send size={22} strokeWidth={2.5} />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
