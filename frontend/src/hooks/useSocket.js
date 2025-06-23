import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useUser from "./useUser";

export const useSocket = () => {
  const socketRef = useRef();
  const [socket, setSocket] = useState(null);
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading || !user || !user.userId) {
      console.log("useSocket - Not ready yet:", {
        loading,
        user: !!user,
        userId: user?.userId,
      });
      return;
    }
    console.log(user.userId);
    const s = io("http://localhost:8000", {
      withCredentials: true,
      auth: {
        userId: user.userId, // Use userId from your user object
      },
    });

    socketRef.current = s;
    setSocket(s);

    s.on("connect", () => {
      console.log("✅ Connected to socket server with ID:", s.id);
    });

    s.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    // Cleanup on unmount or user change
    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [user, loading]);

  return { socket, isConnected: !!socket };
};
