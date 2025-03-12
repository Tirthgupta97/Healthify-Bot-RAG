import { useState, useEffect, useRef } from "react";
import { Mic, Send, Volume2 } from "lucide-react";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const chatContainerRef = useRef(null);

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  const textToSpeech = (text) => {
    if (!text) return;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(speech);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMessage]);

      if (isVoiceMode) {
        textToSpeech(data.reply);
        setIsVoiceMode(false);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Error connecting to AI backend." }]);
    }
  };

  const startVoiceRecognition = () => {
    setIsVoiceMode(true);
    recognition.start();
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInput(transcript);
    sendMessage();
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-100 to-white px-4 sm:px-8">
      {/* Chatbot Container */}
      <div className="relative w-full h-[90vh] mx-auto p-4 sm:p-6 bg-white/60 shadow-2xl rounded-3xl backdrop-blur-lg border border-white/50 flex flex-col">
        
        {/* Chatbot Header */}
        <div className="text-center text-indigo-700 text-xl sm:text-2xl font-semibold pb-3 border-b border-indigo-300">
          Healthify AI Chatbot
        </div>

        {/* Messages Box */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 mt-2 sm:mt-4 bg-white border border-indigo-200 rounded-xl shadow-inner"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-center ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              } mb-3 sm:mb-4 transition-all duration-300`}
            >
              <div
                className={`px-4 sm:px-5 py-2 sm:py-3 rounded-xl max-w-[85%] text-sm sm:text-md shadow ${
                  msg.sender === "user"
                    ? "bg-indigo-500 text-white"
                    : "bg-indigo-100 text-gray-700"
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === "bot" && (
                <button
                  onClick={() => textToSpeech(msg.text)}
                  className="ml-2 sm:ml-3 text-indigo-600 hover:text-indigo-800 transition-transform transform hover:scale-125 cursor-pointer"
                >
                  <Volume2 size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Input and Buttons */}
        <div className="flex mt-3 sm:mt-5 gap-2 sm:gap-3">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-indigo-400 rounded-full outline-none focus:ring focus:ring-indigo-300 text-sm sm:text-lg transition-all"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={startVoiceRecognition}
            className="bg-indigo-500 text-white p-3 sm:p-4 rounded-full hover:bg-indigo-700 transition-all flex items-center justify-center shadow-md cursor-pointer"
          >
            <Mic size={20} />
          </button>
          <button
            onClick={sendMessage}
            className="bg-indigo-500 text-white p-3 sm:p-4 rounded-full hover:bg-indigo-700 transition-all flex items-center justify-center shadow-md cursor-pointer"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
