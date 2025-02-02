"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wallet, Activity, Calendar, Stethoscope, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, children }: any) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="relative group"
  >
    <a
      href={to}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-blue-50/50 transition-all duration-200"
    >
      <span className="text-blue-600 group-hover:text-blue-700">{icon}</span>
      <span className="text-gray-700 hover:text-blue-600 transition-colors">
        {children}
      </span>
    </a>
  </motion.div>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("doctorToken");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        return decodedToken.email;
      } catch {
        return null;
      }
    }
    return null;
  });

  const pathname = usePathname();
  const isAuthPage = pathname === "/auth" || pathname === "/doctor/auth";

  // Check for token type
  const tokenType = localStorage.getItem("doctorToken") ? "doctor" : "user";
  const isLoggedIn = Boolean(
    localStorage.getItem("token") || localStorage.getItem("doctorToken")
  );

  if (isAuthPage) return null;

  const handleLogout = () => {
    if (tokenType === "doctor") {
      localStorage.removeItem("doctorToken");
    } else {
      localStorage.removeItem("token");
    }
    setUserEmail(null);
    setIsOpen(false);
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent mb-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <a href="/" className="flex items-center space-x-3">
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
          </a>

          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                {tokenType === "user" && (
                  <>
                    <NavItem to="/wallet" icon={<Wallet className="h-5 w-5" />}>
                      Wallet
                    </NavItem>
                    <NavItem
                      to="/tracker"
                      icon={<Activity className="h-5 w-5" />}
                    >
                      Health Tracker
                    </NavItem>
                    <NavItem
                      to="/appointments"
                      icon={<Calendar className="h-5 w-5" />}
                    >
                      Appointments
                    </NavItem>
                    <NavItem
                      to="/booking"
                      icon={<Stethoscope className="h-5 w-5" />}
                    >
                      Find Doctors
                    </NavItem>
                  </>
                )}

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Popover>
                    <PopoverTrigger>
                      <Avatar className="h-10 w-10 bg-blue-500 text-white cursor-pointer ring-2 ring-blue-200 hover:ring-blue-400 transition-all duration-200">
                        <AvatarFallback className="bg-blue-700">
                          {userEmail?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto m-0 p-0 flex justify-center items-center bg-white/80 backdrop-blur-lg">
                      <Button
                        className="bg-white text-red-500 hover:bg-white hover:text-red"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </PopoverContent>
                  </Popover>
                </motion.div>
              </>
            ) : (
              <a href="/auth">
                <Button
                  variant="outline"
                  className="bg-blue-700 text-white hover:bg-blue-800 hover:text-white"
                >
                  <span>LogIn</span>
                </Button>
              </a>
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
            className="md:hidden bg-white/80 backdrop-blur-lg shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-lg">
                    <Avatar className="h-10 w-10 bg-blue-500 text-white">
                      <AvatarFallback className="bg-blue-700">
                        {userEmail?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-700">{userEmail}</span>
                  </div>

                  {tokenType === "user" && (
                    <>
                      <NavItem
                        to="/wallet"
                        icon={<Wallet className="h-5 w-5" />}
                      >
                        Wallet
                      </NavItem>
                      <NavItem
                        to="/tracker"
                        icon={<Activity className="h-5 w-5" />}
                      >
                        Health Tracker
                      </NavItem>
                      <NavItem
                        to="/appointments"
                        icon={<Calendar className="h-5 w-5" />}
                      >
                        Appointments
                      </NavItem>
                      <NavItem
                        to="/booking"
                        icon={<Stethoscope className="h-5 w-5" />}
                      >
                        Find Doctors
                      </NavItem>
                    </>
                  )}

                  <Button
                    className="bg-white text-red-500 hover:bg-white hover:text-red w-full mt-4"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <a href="/auth" className="block">
                  <Button
                    variant="outline"
                    className="w-full bg-blue-700 text-white hover:bg-blue-800 hover:text-white"
                  >
                    <span>LogIn</span>
                  </Button>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
