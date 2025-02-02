import React, { useState, useEffect, useRef } from "react";
import { Send, X, Check } from "lucide-react"; // Import the Check icon
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface Message {
  text: string;
  isUser: boolean;
  isChecked?: boolean; // Add isChecked to the Message interface
}

interface ChatbotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isDarkMode: boolean;
  initialMessage?: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  isOpen,
  setIsOpen,
  isDarkMode,
  initialMessage = "Hi there! How can I help you today?",
}) => {
  const token = localStorage.getItem("token");
  let decodedToken: any;
  if (token) {
    decodedToken = jwtDecode(token);
    console.log("Decoded token:", decodedToken);
  }

  let userId: any;
  if (decodedToken && decodedToken.userId) {
    userId = decodedToken.userId;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        `http://localhost:8000/api/chatbot/chats/${userId}`
      );
      console.log("Fetched chat history:", response.data);

      // Access the chatHistory array inside the response.data object
      const chatHistory = response.data.chatHistory;

      // Ensure chatHistory is an array
      if (Array.isArray(chatHistory)) {
        const formattedMessages = chatHistory
          .map((chat: any) => {
            // Check if the necessary properties exist in chat object
            if (chat.question && chat.aiResponse?.analysis) {
              return [
                {
                  text: chat.question,
                  isUser: true,
                  isChecked: chat.isChecked, // Add isChecked for user messages
                },
                {
                  text: chat.aiResponse.analysis,
                  isUser: false,
                  isChecked: chat.isChecked, // Add isChecked for AI responses
                },
              ];
            } else {
              console.warn("Invalid chat data:", chat);
              return []; // Return an empty array if data is invalid
            }
          })
          .flat(); // Flatten the array to merge user & AI messages properly

        console.log("Formatted messages:", formattedMessages);
        setMessages(formattedMessages);
      } else {
        console.error("chatHistory is not an array:", chatHistory);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOldMessages();
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newMessages = [
        ...messages,
        { text: inputValue, isUser: true, isChecked: false }, // New user messages are unchecked by default
      ];
      setMessages([
        ...newMessages,
        { text: "Gyani is thinking...", isUser: false, isChecked: false },
      ]);
      setInputValue("");

      try {
        const response = await axios.post(
          `http://localhost:8000/api/chatbot/diagnose`,
          { question: inputValue, userId: decodedToken.userId }
        );

        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }

        const botMessage = response.data.analysis;
        console.log("Bot response:", botMessage);
        setMessages([
          ...newMessages,
          { text: botMessage, isUser: false, isChecked: false }, // New AI responses are unchecked by default
        ]);
      } catch (error) {
        console.error("Error fetching response:", error);
        setMessages([
          ...newMessages,
          {
            text: "Sorry, something went wrong.",
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

  const formatMessage = (text: string | undefined) => {
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
      return text; // Return original text if formatting fails
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
                    {message.isChecked && ( // Show checkmark if isChecked is true
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
