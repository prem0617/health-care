import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight, UserCircle2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { BACKEND_URL } from "@/config";

export default function PatientAuth() {
  const [date, setDate] = useState();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            email: formData.email,
            password: formData.password,
            profile: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              mobile: formData.phone,
            },
          };

      const response = await axios.post(`${BACKEND_URL}${endpoint}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message || "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex lg:flex-1 bg-black items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-bold mb-6">
            {isLogin ? "Welcome Back!" : "Join Us Today"}
          </h1>
          <p className="text-gray-400 text-lg">
            {isLogin
              ? "Sign in to access your appointments and medical records."
              : "Create an account to book appointments and manage your healthcare journey."}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                placeholder="your@email.com"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-900
                       flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isLogin ? "Sign In" : "Create Account"}</span>
              {!loading && <ArrowRight size={20} />}
              {loading && (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-black hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>

          <div className="mt-6 text-center w-full">
            <button
              onClick={() => navigate("/doctor/auth")}
              className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-lg
                         shadow-md hover:shadow-lg transform hover:scale-105 transition-all
                         font-semibold text-sm flex items-center justify-center mx-auto space-x-2"
            >
              <UserCircle2 size={18} />
              <span>Login as Doctor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
