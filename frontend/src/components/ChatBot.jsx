import React, { useState, useEffect, useRef } from "react";
import { Send, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const Chatbot = ({
  isOpen,
  setIsOpen,
  isDarkMode,
  initialMessage = "Hi there! How can I help you today?",
}) => {
  const [token, setToken] = useState();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  let decodedToken;
  if (token) {
    try {
      decodedToken = jwtDecode(token);
    } catch (e) {
      console.error("Invalid token");
    }
  }

  const userId = decodedToken?.userId;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ text: initialMessage, isUser: false }]);
    }
  }, [isOpen, initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchOldMessages = async () => {
    try {
      if (!userId) return;

      const response = await axios.get(
        `https://health-care-j1k8.onrender.com/api/chatbot/chats/${userId}`
      );

      if (Array.isArray(response.data.chatHistory)) {
        const formattedMessages = response.data.chatHistory
          .map((chat) => {
            if (chat.question && chat.aiResponse?.analysis) {
              return [
                {
                  text: chat.question,
                  isUser: true,
                  isChecked: chat.isChecked,
                },
                {
                  text: chat.aiResponse.analysis,
                  isUser: false,
                  isChecked: chat.isChecked,
                },
              ];
            }
            return [];
          })
          .flat();

        setMessages([
          { text: initialMessage, isUser: false },
          ...formattedMessages,
        ]);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setMessages([{ text: initialMessage, isUser: false }]);
        return;
      }

      console.error("Error fetching chat history:", error);
      setMessages([{ text: initialMessage, isUser: false }]);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOldMessages();
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newMessages = [
        ...messages,
        { text: inputValue, isUser: true, isChecked: false },
      ];
      setMessages([
        ...newMessages,
        { text: "Gyani is thinking...", isUser: false, isChecked: false },
      ]);
      setInputValue("");

      try {
        const response = await axios.post(
          `https://health-care-j1k8.onrender.com/api/chatbot/diagnose`,
          { question: inputValue, userId }
        );

        const botMessage = response.data.analysis;
        setMessages([
          ...newMessages,
          { text: botMessage, isUser: false, isChecked: false },
        ]);
      } catch (error) {
        console.error("Error fetching response:", error);
        setMessages([
          ...newMessages,
          {
            text: "Sorry, something went wrong. Please try again.",
            isUser: false,
            isChecked: false,
          },
        ]);
      } finally {
        setMessages((prevMessages) =>
          prevMessages.filter(
            (message) => message.text !== "Gyani is thinking..."
          )
        );
      }
    }
  };

  const formatMessage = (text) => {
    if (!text) return "";

    try {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-bold text-lg">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      });
    } catch (error) {
      console.error("Error formatting message:", error);
      return text;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", zIndex: 50 }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed inset-y-0 right-0 w-full md:w-screen shadow-2xl ${
            isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
          }`}
          style={{
            boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
          }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div
              className={`flex justify-between items-center p-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h2 className="text-xl text-center font-bold">Gyani AI</h2>
              <button
                onClick={() => setIsOpen(false)}
                className={`rounded-full p-2 transition-colors ${
                  isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chat area */}
            <div className="flex-grow overflow-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg relative ${
                      message.isUser
                        ? isDarkMode
                          ? "bg-purple-600 text-white"
                          : "bg-indigo-500 text-white"
                        : isDarkMode
                        ? "bg-gray-800 text-gray-100"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {formatMessage(message.text)}
                    </div>
                    {message.isChecked && (
                      <div
                        className={`absolute -top-2 -right-2 p-1 rounded-full ${
                          isDarkMode ? "bg-green-600" : "bg-green-500"
                        }`}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form
              onSubmit={handleSubmit}
              className={`p-4 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div
                className={`flex rounded-lg overflow-hidden ${
                  isDarkMode ? "bg-gray-800" : "bg-white border"
                }`}
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className={`flex-grow p-3 focus:outline-none ${
                    isDarkMode
                      ? "bg-gray-800 text-gray-100"
                      : "bg-white text-gray-900"
                  }`}
                />
                <button
                  type="submit"
                  className={`p-3 transition-colors ${
                    isDarkMode
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-indigo-500 text-white hover:bg-indigo-600"
                  }`}
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
