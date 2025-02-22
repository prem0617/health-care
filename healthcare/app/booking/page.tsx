"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DoctorCard from "@/components/custom/DoctorCard";
import type { Doctor } from "@/lib/types";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Specialization } from "../doctor/auth/page";

const DoctorsPage = () => {
  const [doctorData, setDoctorData] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("All"); // Default to "All"
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 9;
  const [specializations, setSpecializations] = useState<Specialization[]>([
    { name: "", _id: "" },
  ]);

  useEffect(() => {
    const filtered = doctorData.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (specialization === "All" || doctor.specialization === specialization)
    );
    setFilteredDoctors(filtered);
    setCurrentPage(1);
  }, [searchTerm, specialization, doctorData]);

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const fetchSpecialization = async () => {
    try {
      const response = await axios.get(
        "https://health-care-j1k8.onrender.com/api/specialization"
      );
      console.log(response);
      setSpecializations(response.data.specializations);
    } catch (error) {}
  };

  const fetchDoctor = async () => {
    try {
      const endpoint = "/api/doctor";
      const response = await axios.get(
        `https://health-care-j1k8.onrender.com${endpoint}`
      );
      setDoctorData(response.data.doctors);
      setFilteredDoctors(response.data.doctors);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDoctor();
    fetchSpecialization();
  }, []);
  console.log(specializations);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 overflow-hidden">
      {/* Animated background shapes */}
      <div className="fixed inset-0 z-0"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl mt-10 font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 animate-gradient">
              Find Your Perfect Doctor
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl text-gray-700"
            >
              Discover top-rated specialists for your health needs
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-indigo-200 rounded-lg bg-white/80 backdrop-blur-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-300"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger className="w-full md:w-64 border-2 border-indigo-200 rounded-lg bg-white/80 backdrop-blur-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-300">
                <SelectValue placeholder="Select Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Specializations</SelectItem>
                {specializations.map((specialization) => (
                  <SelectItem
                    value={
                      specialization.name && specialization.name.trim() !== ""
                        ? specialization.name
                        : "default"
                    }
                    key={specialization._id}
                  >
                    {specialization.name
                      ? specialization.name.charAt(0).toUpperCase() +
                        specialization.name.slice(1)
                      : "Unnamed Specialization"}
                  </SelectItem>
                ))}
                {/* <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="dermatology">Dermatology</SelectItem>
                <SelectItem value="neurology">Neurology</SelectItem> */}
                {/* Add more specializations as needed */}
              </SelectContent>
            </Select>
          </motion.div>

          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {currentDoctors.map((doctor: Doctor, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <DoctorCard doctor={doctor} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredDoctors.length > doctorsPerPage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex justify-center mt-12"
            >
              {Array.from({
                length: Math.ceil(filteredDoctors.length / doctorsPerPage),
              }).map((_, index) => (
                <Button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  className="mx-1 bg-white/80 backdrop-blur-sm hover:bg-indigo-100 border-indigo-200 text-indigo-600 hover:text-indigo-700 transition-all duration-300"
                >
                  {index + 1}
                </Button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorsPage;
