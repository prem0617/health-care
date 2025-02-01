"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, LogIn, Menu, X, User2Icon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation"; // Using usePathname from next/navigation
import { jwtDecode } from "jwt-decode";

// Define type for user state
interface User {
  name: string;
}

// Simulated auth state (replace with actual auth logic)

interface NavItemProps {
  href: string;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ href, children }) => (
  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
    <Link
      href={href}
      className="text-gray-700 hover:text-blue-600 transition-colors"
    >
      {children}
    </Link>
  </motion.div>
);

export default function Navbar() {
  const token = localStorage.getItem("token");

  if (token) {
    const decodedToken = jwtDecode(token);
    console.log(decodedToken);
  }

  const user = {
    name: "PREM",
  };
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Using usePathname to get current pathname

  // Check if we are on the /auth or /doctor/auth page
  const isAuthPage = pathname === "/auth" || pathname === "/doctor/auth";

  // Return null to hide the navbar when on /auth or /doctor/auth page
  if (isAuthPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg">CH</span>
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ChikitsaHub
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {localStorage.getItem("token") ? (
              <>
                <NavItem href="/wallet">Wallet</NavItem>
                <NavItem href="/tracker">Health Tracker</NavItem>
                <NavItem href="/chat">
                  <MessageCircle className="h-6 w-6" />
                </NavItem>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar className="h-10 w-10 bg-blue-500 text-white flex justify-center items-center">
                    <User2Icon>{user?.name?.charAt(0) || "U"}</User2Icon>
                  </Avatar>
                </motion.div>
              </>
            ) : (
              <Link href={"/auth"}>
                <Button
                  variant="outline"
                  className="bg-blue-700 text-white hover:bg-blue-800 hover:text-white"
                >
                  <LogIn className="h-5 w-5" />
                  <span>LogIn</span>
                </Button>
              </Link>
            )}
          </div>

          <motion.button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <NavItem href="/tracker">Health Tracker</NavItem>
              <NavItem href="/chat">
                <MessageCircle className="h-6 w-6" />
              </NavItem>
              {localStorage.getItem("token") ? (
                <>
                  <NavItem href="/health-tracker">Health Tracker</NavItem>
                  <NavItem href="/chat">Chat with Doctor</NavItem>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10 bg-blue-500 text-white">
                      <AvatarFallback>
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-700">{user?.name}</span>
                  </div>
                </>
              ) : (
                <Link href={"/auth"}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative overflow-hidden borderbg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                    <span className="relative flex items-center space-x-2 text-white">
                      <LogIn className="h-4 w-4" />
                      <span>LogIn</span>
                    </span>
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
