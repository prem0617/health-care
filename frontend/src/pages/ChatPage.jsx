import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, User } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

const ChatPage = () => {
  const { id: receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const [receiverDetails, setReceiverDetails] = useState(null);
  const [loading, setLoading] = useState();

  const { socket } = useSocket();

  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef(null);

  const token =
    localStorage.getItem("doctorToken") || localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;

  const senderId = decodedToken?.userId;
  const senderRole = decodedToken?.role;

  const senderModel = senderRole === "DOCTOR" ? "Doctor" : "User";

  // decide which one is user and which one is doctor
  const userId = senderRole === "USER" ? senderId : receiverId;
  const doctorId = senderRole === "DOCTOR" ? senderId : receiverId;

  // Auto-scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/messages/${userId}/${doctorId}`
        );
        setMessages(res.data);
        console.log(res);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    if (senderId && receiverId) {
      fetchMessages();
    }
  }, [senderId, receiverId, userId, doctorId]);

  // Send message
  const handleSend = async () => {
    if (!content.trim()) return;
    console.log({
      user: userId,
      doctor: doctorId,
      sender: senderId,
      senderModel,
      content,
    });
    try {
      const res = await axios.post(
        "http://localhost:8000/api/messages",
        {
          user: userId,
          doctor: doctorId,
          sender: senderId,
          senderModel,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res);
      setMessages((prev) => [...prev, res.data]); // append new message
      setContent(""); // clear input
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // SOCKET

  useEffect(() => {
    if (!socket) return;

    function handleNewMessage(message) {
      setMessages((prev) => [...prev, message]);
      console.log("new Message");
      console.log(message);
    }

    socket.on("new-message", handleNewMessage);
  }, [socket]);

  useEffect(() => {
    const fetchReceiverDetails = async () => {
      if (!receiverId || !senderModel) return;
      setLoading(true);
      const model = senderModel === "Doctor" ? "User" : "Doctor";
      console.log(
        `http://localhost:8000/api/users/${model.toLowerCase()}s/${receiverId}`
      );
      try {
        const res = await axios.get(
          `http://localhost:8000/api/user/${model.toLowerCase()}s/${receiverId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(res);
        setReceiverDetails(res.data);
      } catch (err) {
        console.error("Error fetching receiver details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReceiverDetails();
  }, [receiverId, senderModel]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return <div>LOADING</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {receiverDetails?.name ||
                      receiverDetails?.profile?.firstName +
                        " " +
                        receiverDetails?.profile?.lastName ||
                      "Unknown"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container - Now takes remaining height */}
      <div className="flex-1 w-6xl mx-auto px-4 py-6 flex flex-col">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col flex-1">
          {/* Messages Area - Takes all available space */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-lg font-medium">Start your conversation</p>
                <p className="text-sm">Send a message to begin chatting</p>
              </div>
            ) : (
              <>
                {messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === senderId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl ${
                        msg.sender === senderId
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          msg.sender === senderId
                            ? "text-white/70"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(
                          msg.createdAt || Date.now()
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="border-t bg-white p-4 flex-shrink-0">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 max-h-32"
                  placeholder="Type your message..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="1"
                  style={{
                    minHeight: "48px",
                    height: "auto",
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!content.trim()}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  content.trim()
                    ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
