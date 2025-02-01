"use client";

import type { Doctor } from "@/lib/types";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const { name, specialization, chatFee, consultationFee } = doctor;
  const [isHovered, setIsHovered] = useState(false);

  console.log(doctor);

  const chatAmount = chatFee?.amount ?? 0;
  const consultAmount = consultationFee?.amount ?? 0;

  return (
    <motion.div
      className="w-full max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-75" />
        <div className="relative p-6 bg-white bg-opacity-90 backdrop-blur-sm z-10">
          <div className="mb-6 text-center">
            <h2 className="mt-4 text-2xl font-bold text-gray-800">
              Dr. {name}
            </h2>
            <p className="text-blue-600 font-medium capitalize">
              {specialization} Specialist
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <ChatIcon />
                <span className="text-gray-700">Chat Fee</span>
              </div>
              <span className="font-semibold text-gray-900">
                ₹{chatAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <ConsultIcon />
                <span className="text-gray-700">Consultation Fee</span>
              </div>
              <span className="font-semibold text-gray-900">
                ₹{consultAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/appointment/${doctor._id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
              >
                Book Consultation
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg transition-all duration-300 hover:from-purple-600 hover:to-purple-700"
            >
              Chat Now
            </motion.button>
          </div>
        </div>

        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <p className="text-white text-center px-4">
              Dr. {name} is available for consultations. Book now to secure your
              slot!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

const ChatIcon = () => (
  <svg
    className="w-5 h-5 text-blue-600"
    fill="none"
    strokeWidth="2"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
    />
  </svg>
);

const ConsultIcon = () => (
  <svg
    className="w-5 h-5 text-purple-600"
    fill="none"
    strokeWidth="2"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  </svg>
);
