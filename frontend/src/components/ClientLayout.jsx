import React, { useEffect, useState, Suspense } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Chatbot } from "./ChatBot";
import GyaniAIButton from "./ChatBotButton";
import Navbar from "./NavBar";

const LayoutContent = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const hideChatbotPaths = [
    "/",
    "/publish",
    "/signin",
    "/auth",
    "/auth/*",
    "/doctor/auth",
    "/doctor/dashboard",
    "/doctor/transactions",
    "/doctor/chatVerification",
  ];

  useEffect(() => {
    const chatOpenParam = searchParams.get("isChatOpen");
    if (chatOpenParam === "true") {
      setIsChatOpen(true);
    }
  }, [searchParams]);

  const shouldHideChatbot = hideChatbotPaths.some((path) =>
    path.endsWith("*")
      ? location.pathname.startsWith(path.slice(0, -1))
      : location.pathname === path
  );

  return (
    <div className="relative">
      <motion.div
        animate={{
          scale: isChatOpen ? 0.95 : 1,
          x: isChatOpen ? -16 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={`relative w-full min-h-screen ${
          isChatOpen ? "pointer-events-none" : ""
        }`}
        style={{
          transformOrigin: "center right",
        }}
      >
        <Navbar />
        {children}
      </motion.div>

      {!shouldHideChatbot && (
        <Chatbot
          isOpen={isChatOpen}
          setIsOpen={setIsChatOpen}
          isDarkMode={false}
        />
      )}

      {!isChatOpen && !shouldHideChatbot && (
        <GyaniAIButton setIsChatOpen={setIsChatOpen} isDarkMode={false} />
      )}
    </div>
  );
};

const ClientLayout = ({ children }) => {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen">
          <Navbar />
          <div className="flex items-center justify-center h-[calc(100vh-64px)]">
            Loading...
          </div>
        </div>
      }
    >
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
};

export default ClientLayout;
