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
import { useParams } from "next/navigation";

interface BookedSlot {
  date: string;
  startTime: string;
}

interface Doctor {
  name: string;
  specialization: string;
  consultationFee: {
    amount: number;
    currency: string;
  };
}

const Page = () => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctor();
    // if (selectedDate) {
    //   fetchBookedSlots(selectedDate);
    // }
  }, [selectedDate]);

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

  //   const fetchBookedSlots = async (date: Date) => {
  //     try {
  //       const formattedDate = date.toISOString().split("T")[0];
  //       const response = await axios.get(
  //         `http://localhost:8000/api/doctor/${id}`,
  //         {
  //           params: {
  //             fromDate: formattedDate,
  //             toDate: formattedDate,
  //             status: "scheduled",
  //           },
  //         }
  //       );

  //       const appointments = response.data.data?.appointments;
  //       if (appointments.length > 0) {
  //         const booked = appointments.map((appointment: any) => ({
  //           date: appointment.date.split("T")[0],
  //           startTime: appointment.slot.startTime,
  //         }));
  //         setBookedSlots(booked);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching booked slots:", error);
  //     }
  //   };

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
            endTime: `${parseInt(selectedTime)}:00`, // Assuming 1-hour slots
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Appointment booked successfully!");
      setSelectedDate(null);
      setSelectedTime(null);
      //   if (selectedDate) {
      //     fetchBookedSlots(selectedDate); // Refresh booked slots
      //   }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side - Doctor Details */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Doctor Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-lg">{doctor.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-500" />
                  <span className="capitalize">{doctor.specialization}</span>
                </div>

                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-blue-500" />
                  <span>
                    Consultation Fee: {doctor.consultationFee.amount}{" "}
                    {doctor.consultationFee.currency}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Booking Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Book Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Calendar */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-blue-500" />
                    Select Date
                  </h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate ?? undefined}
                    onSelect={(date) => {
                      setSelectedDate(date ?? null);
                      setSelectedTime(null); // Reset time selection when date changes
                    }}
                    className="rounded-md border"
                    disabled={[
                      { before: new Date() }, // Disable past dates
                    ]}
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Select Time
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {timeSlots.map(({ time, isBooked }) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        disabled={isBooked}
                        className={`p-2 rounded-md border transition-colors ${
                          isBooked
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : selectedTime === time
                            ? "bg-blue-500 text-white border-blue-500"
                            : "hover:bg-blue-50"
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
                  className="w-full"
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
        <div className="text-center text-gray-500">
          Loading doctor details...
        </div>
      )}
    </div>
  );
};

export default Page;
