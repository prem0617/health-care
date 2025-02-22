"use client";

import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  CalendarDays,
  IndianRupee,
  User,
  Stethoscope,
  MapPin,
  Star,
} from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Appointment, BookedSlot, Doctor } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

const Page = () => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchDoctor = async () => {
    try {
      const response = await axios.get(
        `https://health-care-j1k8.onrender.com/api/doctor/${id}`
      );
      setDoctor(response.data.doctor);
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      toast.error("Failed to load doctor details. Please try again.");
    }
  };

  const fetchBookedSlots = async () => {
    try {
      const response = await axios.get(
        `https://health-care-j1k8.onrender.com/api/appointments/doctor/${id}`
      );
      console.log(response, "Doctor Booked slots");
      const appointments = response.data.data?.upcomingAppointments;
      if (appointments && appointments.length > 0) {
        const booked = appointments.map((appointment: any) => ({
          date: appointment.date.split("T")[0],
          startTime: appointment.slot.startTime,
        }));
        setBookedSlots(booked);
        const appointmentDetails = appointments.map((appointment: any) => ({
          date: appointment.date,
          startTime: appointment.slot.startTime,
          patientName: `${appointment.patientId.profile.firstName} ${appointment.patientId.profile.lastName}`,
          isFirstConsultation: appointment.isFirstConsultation,
        }));
        setAppointments(appointmentDetails);
      }
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      toast.error("Failed to load appointment slots. Please try again.");
    }
  };

  useEffect(() => {
    fetchDoctor();
    fetchBookedSlots();
  }, []);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      const timeString = `${hour}:00`;
      slots.push({
        time: timeString,
        isBooked: isSlotBooked(timeString),
      });
    }
    return slots;
  };

  const isSlotBooked = (time: string) => {
    if (!selectedDate) return false;
    const formattedDate = selectedDate.toISOString().split("T")[0];
    return bookedSlots.some(
      (slot) => slot.date === formattedDate && slot.startTime === time
    );
  };

  const handleAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time slot.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://health-care-j1k8.onrender.com/api/appointments",
        {
          doctorId: id,
          date: selectedDate,
          slot: {
            startTime: selectedTime,
            endTime: `${parseInt(selectedTime)}:00`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Appointment booked successfully!");
      if (response.status === 201) {
        router.push("/wallet");
      }
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast.error(
        error.response?.data?.message || "Failed to book appointment."
      );
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-gray-50 pt-[80px]">
      <div className="container mx-auto px-4 py-6">
        {doctor && bookedSlots ? (
          <div className="flex flex-col space-y-6 max-w-6xl mx-auto">
            {/* Doctor Profile Card */}
            <Card className="shadow-lg border-0 bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-white">
                          {doctor.name}
                        </h1>
                        <p className="text-blue-100 flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          <span className="capitalize">
                            {doctor.specialization}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-white/90">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Mumbai, India</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>4.8 (120+ reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                    <p className="text-sm">Consultation Fee</p>
                    <div className="flex items-center gap-1 text-xl font-bold">
                      <IndianRupee className="h-5 w-5" />
                      <span>{doctor.consultationFee.amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Book Appointment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Calendar */}
                      <div className="flex-1">
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-700">
                          <CalendarDays className="w-4 h-4 text-blue-500" />
                          Select Date
                        </h3>
                        <Calendar
                          mode="single"
                          selected={selectedDate ?? undefined}
                          onSelect={(date) => {
                            setSelectedDate(date ?? null);
                            setSelectedTime(null);
                          }}
                          className="rounded-lg border shadow-sm"
                          disabled={[{ before: new Date() }]}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-blue-500" />
                          Select Time
                        </h3>
                        <ScrollArea className="h-[300px] rounded-lg border p-4">
                          <div className="grid grid-cols-2 gap-3">
                            {timeSlots.map(({ time, isBooked }: any) => (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                disabled={isBooked}
                                className={`p-3 rounded-lg border transition-all duration-200 text-sm font-medium ${
                                  isBooked
                                    ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                                    : selectedTime === time
                                    ? "bg-blue-500 text-white border-blue-500 shadow-md"
                                    : "hover:bg-blue-50 hover:border-blue-200 text-gray-700"
                                }`}
                              >
                                {time}
                                {isBooked && " (Booked)"}
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                      disabled={!selectedTime || loading}
                      onClick={handleAppointment}
                    >
                      {loading ? "Booking..." : "Book Appointment"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Appointments */}
              <div className="w-full lg:w-[400px]">
                <Card className="shadow-lg border-0">
                  <CardHeader className="border-b">
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Upcoming Appointments
                    </CardTitle>
                  </CardHeader>
                  <ScrollArea className="h-[500px]">
                    <CardContent className="p-4">
                      {appointments && appointments.length > 0 ? (
                        <div className="space-y-4">
                          {appointments.map((appointment) => (
                            <div
                              key={appointment.date + appointment.startTime}
                              className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <div className="font-medium text-gray-900">
                                    {appointment.patientName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(
                                      appointment.date
                                    ).toLocaleDateString("en-US", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                                  {appointment.startTime}
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                {appointment.isFirstConsultation
                                  ? "First Visit"
                                  : "Follow-up"}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No appointments scheduled
                        </div>
                      )}
                    </CardContent>
                  </ScrollArea>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-pulse text-xl text-gray-600">
              Loading doctor details...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
