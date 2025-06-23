"use client";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Calendar,
  Stethoscope,
  Menu,
  X,
  Heart,
  Shield,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Link } from "react-router-dom";
import useUser from "@/hooks/useUser";

const NavItem = ({ to, icon, children }) => (
  <motion.div
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    className="relative group"
  >
    <Link
      to={to}
      className="flex items-center space-x-3 px-5 py-3 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-white/20"
    >
      <motion.span
        className="text-blue-600 group-hover:text-blue-500 transition-colors"
        whileHover={{ scale: 1.1 }}
      >
        {icon}
      </motion.span>
      <span className="text-slate-700 group-hover:text-blue-600 transition-colors font-medium">
        {children}
      </span>
    </Link>
  </motion.div>
);

const getEmailFromToken = () => {
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
};

const Navbar = () => {
  const { clearUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const pathname = location.pathname;
  const isAuthPage = pathname === "/auth" || pathname === "/doctor/auth";

  const tokenType = localStorage.getItem("doctorToken") ? "doctor" : "token";
  const isLoggedIn = Boolean(
    localStorage.getItem("token") || localStorage.getItem("doctorToken")
  );

  useEffect(() => {
    setUserEmail(getEmailFromToken());

    const handleStorageChange = () => {
      setUserEmail(getEmailFromToken());
    };

    window.addEventListener("storage", handleStorageChange);

    const intervalId = setInterval(() => {
      const currentEmail = getEmailFromToken();
      if (currentEmail !== userEmail) {
        setUserEmail(currentEmail);
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [userEmail]);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    if (tokenType === "doctor") {
      localStorage.removeItem("doctorToken");
    } else {
      localStorage.removeItem("token");
    }
    clearUser();
    setUserEmail(null);
    setIsOpen(false);
    navigate("/");
  };

  const getAvatarLetter = () => {
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }
    return isLoggedIn ? "..." : "U";
  };

  if (isAuthPage) return null;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        hasScrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6">
        <div
          className={`flex items-center justify-between h-20 ${
            tokenType === "doctor" ? "pl-8" : ""
          }`}
        >
          {/* Logo Section */}
          <Link
            to={tokenType === "doctor" ? "/doctor/dashboard" : "/"}
            className="flex items-center space-x-4 group"
          >
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <Heart className="h-6 w-6 text-white" fill="currentColor" />
                </motion.div>
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Shield className="h-2 w-2 text-white" />
              </motion.div>
            </motion.div>
            <div className="flex flex-col">
              <motion.span
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent"
                whileHover={{ scale: 1.02 }}
              >
                ChikitsaHub
              </motion.span>
              <span className="text-xs text-slate-500 font-medium tracking-wide">
                Healthcare Excellence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              <>
                {tokenType === "token" && (
                  <>
                    <NavItem to="/wallet" icon={<Wallet className="h-5 w-5" />}>
                      Wallet
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-4"
                >
                  <Popover>
                    <PopoverTrigger>
                      <Avatar className="h-11 w-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 text-white cursor-pointer ring-2 ring-blue-200 hover:ring-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white font-semibold">
                          {getAvatarLetter()}
                        </AvatarFallback>
                      </Avatar>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 bg-white/90 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6"
                          onClick={handleLogout}
                        >
                          Logout
                        </Button>
                      </motion.div>
                    </PopoverContent>
                  </Popover>
                </motion.div>
              </>
            ) : (
              <Link to="/auth">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white border-none hover:from-blue-700 hover:via-purple-700 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-2.5 font-medium"
                  >
                    Sign In
                  </Button>
                </motion.div>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6 text-slate-700" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6 text-slate-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white/90 backdrop-blur-xl shadow-2xl border-t border-white/20"
          >
            <div className="container mx-auto px-6 py-6 space-y-4">
              {isLoggedIn ? (
                <>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-blue-100"
                  >
                    <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 text-white shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white font-semibold">
                        {getAvatarLetter()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-medium">
                        {userEmail}
                      </span>
                      <span className="text-xs text-slate-500">
                        {tokenType === "doctor"
                          ? "Doctor Account"
                          : "Patient Account"}
                      </span>
                    </div>
                  </motion.div>

                  {tokenType === "token" && (
                    <>
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <NavItem
                          to="/wallet"
                          icon={<Wallet className="h-5 w-5" />}
                        >
                          Wallet
                        </NavItem>
                      </motion.div>
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <NavItem
                          to="/appointments"
                          icon={<Calendar className="h-5 w-5" />}
                        >
                          Appointments
                        </NavItem>
                      </motion.div>
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <NavItem
                          to="/booking"
                          icon={<Stethoscope className="h-5 w-5" />}
                        >
                          Find Doctors
                        </NavItem>
                      </motion.div>
                    </>
                  )}

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 w-full mt-6 rounded-xl py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link to="/auth" className="block">
                    <Button
                      variant="outline"
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white border-none hover:from-blue-700 hover:via-purple-700 hover:to-pink-600 rounded-xl py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Sign In
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="h-[0.1px] shadow-slate-300  shadow"></div>
    </motion.nav>
  );
};

export default Navbar;
