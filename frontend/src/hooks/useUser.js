import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/config";

function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialized = useRef(false);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    const doctorToken = localStorage.getItem("doctorToken");

    const usedToken = doctorToken || token;
    if (!usedToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${usedToken}`,
        },
      });
      setUser(response.data);
      localStorage.setItem("userData", JSON.stringify(response.data));
      setError(null);
    } catch (err) {
      setError("Failed to fetch user");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("doctorToken");
        localStorage.removeItem("userData");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    try {
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setLoading(false);
      } else {
        fetchUser();
      }
    } catch {
      localStorage.removeItem("userData");
      fetchUser();
    }
  }, []);

  const saveUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("userData");
    setError(null);
  }, []);

  const refetchUser = useCallback(() => {
    localStorage.removeItem("userData");
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    saveUser,
    clearUser,
    refetchUser,
    loading,
    error,
  };
}

export default useUser;
