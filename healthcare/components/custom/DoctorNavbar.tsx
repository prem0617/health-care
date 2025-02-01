import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, LogIn, Menu, X, User2Icon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface User {
  email: string;
}

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

export default function DoctorNavbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null); // Use state for user data
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // State to track if we are on an auth page
  const [isAuthPage, setIsAuthPage] = useState(false);

  // Effect hook for detecting the auth page after the first render
  useEffect(() => {
    if (pathname === "/auth" || pathname === "/doctor/auth") {
      setIsAuthPage(true);
    } else {
      setIsAuthPage(false);
    }
  }, [pathname]);

  // Check the token once when the component mounts
  useEffect(() => {
    if (!isAuthPage) {
      const token = localStorage.getItem("doctorToken");
      if (token) {
        const decodedToken = jwtDecode(token);
        console.log(decodedToken);
        setUser(decodedToken as User); // Update user state
      }
    }
  }, [isAuthPage]); // Re-run the effect only if isAuthPage changes

  const handleLogout = () => {
    localStorage.removeItem("doctorToken"); // Correct token key
    setUser(null); // Reset user state
    router.push("/");
  };

  // Only render the navbar if it's not an auth page
  if (isAuthPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/doctor/dashboard"
            className="flex items-center space-x-2"
          >
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
            {user ? (
              <>
                <NavItem href="/chat">
                  <MessageCircle className="h-6 w-6" />
                </NavItem>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Popover>
                    <PopoverTrigger>
                      <Avatar className="h-10 w-10 bg-blue-500 text-white">
                        <AvatarFallback className="bg-blue-700">
                          {user?.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto m-0 p-0 flex justify-center items-center">
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
              <Link href={"/auth"}>
                <Button
                  variant="outline"
                  className="bg-blue-700 text-white hover:bg-blue-800 hover:text-white"
                >
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
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10 bg-blue-500 text-white">
                      <AvatarFallback className="bg-blue-700">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-700">{user?.email}</span>
                  </div>
                  <Button
                    className="bg-white text-red-500 hover:bg-white hover:text-red"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link href={"/auth"}>
                  <Button
                    variant="outline"
                    className="bg-blue-700 text-white hover:bg-blue-800 hover:text-white"
                  >
                    <span>LogIn</span>
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
