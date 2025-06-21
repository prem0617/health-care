"use client"

import { useState, useEffect, useRef } from "react"
import { Send, X, MessageCircle, User, Loader2, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { BACKEND_URL } from "@/config"

export const Chatbot = ({ isOpen, setIsOpen, isDarkMode, initialMessage = "Hi there! How can I help you today?" }) => {
  const [token, setToken] = useState()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) setToken(storedToken)
  }, [])

  let decodedToken
  if (token) {
    try {
      decodedToken = jwtDecode(token)
    } catch (e) {
      console.error("Invalid token")
    }
  }

  const userId = decodedToken?.userId

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ text: initialMessage, isUser: false }])
    }
  }, [isOpen, initialMessage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchOldMessages = async () => {
    try {
      if (!userId) return

      const response = await axios.get(`${BACKEND_URL}/api/chatbot/chats/${userId}`)

      if (Array.isArray(response.data.chatHistory)) {
        const formattedMessages = response.data.chatHistory.flatMap((chat) => {
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
            ]
          }
          return []
        })

        setMessages([{ text: initialMessage, isUser: false }, ...formattedMessages])
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setMessages([{ text: initialMessage, isUser: false }])
        return
      }

      console.error("Error fetching chat history:", error)
      setMessages([{ text: initialMessage, isUser: false }])
    }
  }

  useEffect(() => {
    if (userId) {
      fetchOldMessages()
    }
  }, [userId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      const newMessages = [...messages, { text: inputValue, isUser: true, isChecked: false }]
      setMessages(newMessages)
      setInputValue("")
      setIsTyping(true)

      try {
        const response = await axios.post(`${BACKEND_URL}/api/chatbot/diagnose`, { question: inputValue, userId })

        const botMessage = response.data.analysis
        setMessages([...newMessages, { text: botMessage, isUser: false, isChecked: false }])
      } catch (error) {
        console.error("Error fetching response:", error)
        setMessages([
          ...newMessages,
          {
            text: "Sorry, something went wrong. Please try again.",
            isUser: false,
            isChecked: false,
          },
        ])
      } finally {
        setIsTyping(false)
      }
    }
  }

  const formatMessage = (text) => {
    if (!text) return ""

    try {
      // Split text into paragraphs first
      const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim())

      return paragraphs.map((paragraph, paragraphIndex) => {
        // Handle bold text within each paragraph
        const parts = paragraph.split(/(\*\*.*?\*\*)/)
        const formattedParts = parts.map((part, index) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={index} className="font-medium">
                {part.slice(2, -2)}
              </strong>
            )
          }
          // Handle single line breaks within paragraphs
          return part.split("\n").map((line, lineIndex, lines) => (
            <span key={`${index}-${lineIndex}`}>
              {line}
              {lineIndex < lines.length - 1 && <br />}
            </span>
          ))
        })

        return (
          <div key={paragraphIndex} className={paragraphIndex > 0 ? "mt-3" : ""}>
            {formattedParts}
          </div>
        )
      })
    } catch (error) {
      console.error("Error formatting message:", error)
      return text
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            exit={{ y: 50 }}
            className={`w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden ${
              isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-gray-200"
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between p-6 ${isDarkMode ? "bg-zinc-800/50" : "bg-gray-50/80"} backdrop-blur-sm`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-emerald-500/20" : "bg-emerald-50"}`}
                >
                  <MessageCircle className={`w-6 h-6 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} />
                </div>
                <div>
                  <h1 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Gyani AI Assistant
                  </h1>
                  <p className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                    Ready to help you with anything
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isDarkMode
                    ? "hover:bg-zinc-700 text-zinc-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              className={`flex-1 overflow-y-auto px-6 py-4 ${isDarkMode ? "bg-zinc-900" : "bg-white"}`}
              style={{ height: "calc(85vh - 140px)" }}
            >
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex gap-4 ${message.isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.isUser
                          ? isDarkMode
                            ? "bg-blue-500/20"
                            : "bg-blue-50"
                          : isDarkMode
                            ? "bg-emerald-500/20"
                            : "bg-emerald-50"
                      }`}
                    >
                      {message.isUser ? (
                        <User className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                      ) : (
                        <MessageCircle className={`w-5 h-5 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} />
                      )}
                    </div>

                    {/* Message */}
                    <div className={`flex-1 max-w-[80%] ${message.isUser ? "text-right" : "text-left"}`}>
                      <div
                        className={`relative inline-block px-6 py-4 rounded-2xl ${
                          message.isUser
                            ? isDarkMode
                              ? "bg-blue-600 text-white"
                              : "bg-blue-500 text-white"
                            : isDarkMode
                              ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                              : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                          {formatMessage(message.text)}
                        </div>
                        {message.isChecked && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </div>

                      <div className={`text-xs mt-2 ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}>
                        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? "bg-emerald-500/20" : "bg-emerald-50"}`}
                    >
                      <MessageCircle className={`w-5 h-5 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} />
                    </div>
                    <div
                      className={`px-6 py-4 rounded-2xl ${isDarkMode ? "bg-zinc-800 border border-zinc-700" : "bg-gray-100"}`}
                    >
                      <div className="flex items-center gap-2">
                        <Loader2 className={`w-4 h-4 animate-spin ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`} />
                        <span className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                          Gyani is thinking...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-4 border-t ${isDarkMode ? "border-zinc-800 bg-zinc-900" : "border-gray-200 bg-white"}`}>
              <form onSubmit={handleSubmit} className="flex items-end gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message here..."
                    disabled={isTyping}
                    className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none text-sm resize-none ${
                      isDarkMode
                        ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 focus:border-emerald-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-emerald-500"
                    } ${isTyping ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                    inputValue.trim() && !isTyping
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl"
                      : isDarkMode
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
