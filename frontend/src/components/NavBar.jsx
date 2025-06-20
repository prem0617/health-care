import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Calendar,
  Stethoscope,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./ui/button"; // adjust path as needed
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"; // adjust path
import { Link } from "react-router-dom";

const NavItem = ({ to, icon, children }) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="relative group"
  >
    <Link
      to={to}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-blue-50/50 transition-all duration-200"
    >
      <span className="text-blue-600 group-hover:text-blue-700">{icon}</span>
      <span className="text-gray-700 hover:text-blue-600 transition-colors">
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
      setHasScrolled(window.scrollY > 0);
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
    setUserEmail(null);
    setIsOpen(false);
    navigate("/");
  };

  const navBackgroundClass = hasScrolled
    ? "bg-white/10 backdrop-blur-md shadow-sm"
    : "bg-transparent";

  const getAvatarLetter = () => {
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }
    return isLoggedIn ? "..." : "U";
  };

  if (isAuthPage) return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 mb-10 transition-all duration-300 ${navBackgroundClass}`}>
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between h-20 ${tokenType === "doctor" ? "pl-14 bg-white" : ""}`}>
          <Link to={tokenType === "doctor" ? "/doctor/dashboard" : "/"} className="flex items-center space-x-3">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
            >
              <div className="text-white font-bold text-lg">CH</div>
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ChikitsaHub
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                {tokenType === "token" && (
                  <>
                    <NavItem to="/wallet" icon={<Wallet className="h-5 w-5" />}>Wallet</NavItem>
                    <NavItem to="/appointments" icon={<Calendar className="h-5 w-5" />}>Appointments</NavItem>
                    <NavItem to="/booking" icon={<Stethoscope className="h-5 w-5" />}>Find Doctors</NavItem>
                  </>
                )}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Popover>
                    <PopoverTrigger>
                      <Avatar className="h-10 w-10 bg-blue-500 text-white cursor-pointer ring-2 ring-blue-200 hover:ring-blue-400 transition-all duration-200">
                        <AvatarFallback className="bg-blue-700">
                          {getAvatarLetter()}
                        </AvatarFallback>
                      </Avatar>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto m-0 p-0 flex justify-center items-center bg-white/80 backdrop-blur-lg">
                      <Button className="bg-white text-red-500 hover:bg-white hover:text-red" onClick={handleLogout}>
                        Logout
                      </Button>
                    </PopoverContent>
                  </Popover>
                </motion.div>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="bg-blue-700 text-white hover:bg-blue-800 hover:text-white">
                  LogIn
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
            className="md:hidden bg-white/80 backdrop-blur-lg shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-lg">
                    <Avatar className="h-10 w-10 bg-blue-500 text-white">
                      <AvatarFallback className="bg-blue-700">{getAvatarLetter()}</AvatarFallback>
                    </Avatar>
                    <span className="text-gray-700">{userEmail}</span>
                  </div>

                  {tokenType === "token" && (
                    <>
                      <NavItem to="/wallet" icon={<Wallet className="h-5 w-5" />}>Wallet</NavItem>
                      <NavItem to="/appointments" icon={<Calendar className="h-5 w-5" />}>Appointments</NavItem>
                      <NavItem to="/booking" icon={<Stethoscope className="h-5 w-5" />}>Find Doctors</NavItem>
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
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full bg-blue-700 text-white hover:bg-blue-800 hover:text-white">
                    LogIn
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
