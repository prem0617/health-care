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
} from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Appointment, BookedSlot, Doctor } from "@/lib/types";

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
        `http://localhost:8000/api/doctor/${id}`
      );
      setDoctor(response.data.doctor);
    } catch (error) {
      console.error("Error fetching doctor details:", error);
    }
  };

  const fetchBookedSlots = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/appointments/doctor/${id}`
      );
      const appointments = response.data.data?.appointments;
      if (appointments.length > 0) {
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
      alert("Please select a date and time slot.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/appointments",
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
      console.log(response);
      toast.success("Appointment booked successfully!");
      if (response.status === 201) {
        router.push("/wallet");
      }
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      alert(error.response?.data?.message || "Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="container mx-auto p-6 mt-[100px]">
      {doctor && bookedSlots ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side - Doctor Details and Appointments */}
          <div className="space-y-8">
            {/* Doctor Details Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-600">
                  Doctor Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-500" />
                    <span className="font-semibold text-lg">{doctor.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-6 h-6 text-blue-500" />
                    <span className="capitalize text-gray-700">
                      {doctor.specialization}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IndianRupee className="w-6 h-6 text-blue-500" />
                    <span className="text-gray-700">
                      Consultation Fee: {doctor.consultationFee.amount}{" "}
                      {doctor.consultationFee.currency}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointments Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-600">
                  Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.date + appointment.startTime}
                        className="p-4 border border-gray-200 rounded-md hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-semibold text-gray-800">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.date}
                          </div>
                        </div>
                        <div className="text-gray-600">
                          Time: {appointment.startTime} |{" "}
                          {appointment.isFirstConsultation
                            ? "First Consultation"
                            : "Follow-up"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    No appointments scheduled.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Booking Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-blue-600">
                Book Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Calendar */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700">
                    <CalendarDays className="w-5 h-5 text-blue-500" />
                    Select Date
                  </h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate ?? undefined}
                    onSelect={(date) => {
                      setSelectedDate(date ?? null);
                      setSelectedTime(null);
                    }}
                    className="rounded-md border"
                    disabled={[{ before: new Date() }]}
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Select Time
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {timeSlots.map(({ time, isBooked }) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        disabled={isBooked}
                        className={`p-3 rounded-md border transition-colors text-sm font-medium ${
                          isBooked
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : selectedTime === time
                            ? "bg-blue-500 text-white border-blue-500"
                            : "hover:bg-blue-50 text-gray-700"
                        }`}
                      >
                        {time}
                        {isBooked && " (Booked)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Book Button */}
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors"
                  disabled={!selectedTime || loading}
                  onClick={handleAppointment}
                >
                  {loading ? "Booking..." : "Book Appointment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-xl text-gray-700">
          Loading doctor details...
        </div>
      )}
    </div>
  );
};

export default Page;
