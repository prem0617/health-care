// ClientLayout.tsx
"use client";
import NavBar from "@/components/custom/NavBar";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Chatbot } from "./ChatBot";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import GyaniAIButton from "./ui/GyaniAIButton";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const hideChatbotPaths = ["/", "/publish", "/signin", "/auth/*"];
  const location = usePathname();

  useEffect(() => {
    const chatOpenParam = new URLSearchParams(
      searchParams as unknown as string
    ).get("isChatOpen");
    if (chatOpenParam === "true") {
      setIsChatOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="relative h-screen overflow-hidden">
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
