"use client";
import { Suspense, useEffect, useState } from "react";
import NavBar from "@/components/custom/NavBar";
import { useSearchParams, usePathname } from "next/navigation";
import { Chatbot } from "./ChatBot";
import { motion } from "framer-motion";
import GyaniAIButton from "./ui/GyaniAIButton";

// Separate component for search params handling
function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const searchParams = useSearchParams();
  const location = usePathname();

  const hideChatbotPaths = [
    "/",
    "/publish",
    "/signin",
    "/auth/*",
    "/auth",
    "/doctor/auth",
    "/doctor/dashboard",
    "/doctor/transactions",
    "/doctor/chatVerification",
  ];

  useEffect(() => {
    const chatOpenParam = new URLSearchParams(
      searchParams as unknown as string
    ).get("isChatOpen");
    if (chatOpenParam === "true") {
      setIsChatOpen(true);
    }
  }, [searchParams]);

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
        <NavBar />
        {children}
      </motion.div>

      {!hideChatbotPaths.includes(location) && (
        <Chatbot
          isOpen={isChatOpen}
          setIsOpen={setIsChatOpen}
          isDarkMode={false}
        />
      )}

      {!isChatOpen && !hideChatbotPaths.includes(location) && (
        <GyaniAIButton setIsChatOpen={setIsChatOpen} isDarkMode={false} />
      )}
    </div>
  );
}

// Main layout component with Suspense boundary
export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen">
          <NavBar />
          <div className="flex items-center justify-center h-[calc(100vh-64px)]">
            Loading...
          </div>
        </div>
      }
    >
      <LayoutContent children={children} />
    </Suspense>
  );
}
