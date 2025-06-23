// AppointmentPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Clock,
  CalendarDays,
  IndianRupee,
  User,
  Stethoscope,
  MapPin,
  Star,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { BACKEND_URL } from "@/config";

export default function AppointmentPage() {
  const [doctor, setDoctor] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // Changed from new Date() to null
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctor();
    fetchBookedSlots();
  }, []);

  const fetchDoctor = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/doctor/${id}`);
      setDoctor(res.data.doctor);
    } catch (err) {
      toast.error("Failed to load doctor details");
    }
  };

  const fetchBookedSlots = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/appointments/doctor/${id}`
      );
      const data = res.data.data;

      // Use the formatted booked slots from backend
      const booked = data.bookedSlots || [];

      // Format appointments for display
      const upcoming = data.upcomingAppointments || [];
      const appointmentList = upcoming.map((appt) => ({
        date: appt.date,
        startTime: appt.slot.startTime,
        patientName: `${appt.patientId.profile.firstName} ${appt.patientId.profile.lastName}`,
        isFirstConsultation: appt.isFirstConsultation,
      }));

      setBookedSlots(booked);
      setAppointments(appointmentList);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      toast.error("Failed to fetch appointments");
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      const time = `${hour.toString().padStart(2, "0")}:00`;
      slots.push({ time, isBooked: isSlotBooked(time) });
    }
    return slots;
  };

  const isSlotBooked = (time) => {
    if (!selectedDate) return false;

    const dateStr = selectedDate.toLocaleDateString("en-CA");

    return bookedSlots.some(
      (slot) => slot.date === dateStr && slot.startTime === time
    );
  };

  const handleAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      return toast.error("Please select both date and time");
    }

    setLoading(true);
    try {
      // Calculate end time (1 hour after start time)
      const startHour = parseInt(selectedTime.split(":")[0]);
      const endTime = `${(startHour + 1).toString().padStart(2, "0")}:00`;

      // Use consistent date formatting
      const dateStr = selectedDate.toLocaleDateString("en-CA");

      const res = await axios.post(
        `${BACKEND_URL}/api/appointments`,
        {
          doctorId: id,
          date: dateStr, // Send formatted date string instead of ISO string
          slot: {
            startTime: selectedTime,
            endTime: endTime,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Appointment booked successfully!");
      if (res.status === 201) {
        await fetchBookedSlots();
        setSelectedTime(null);
        navigate("/wallet");
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset selected time when date changes
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-gray-50 pt-[80px]">
      <div className="container mx-auto px-4 py-6">
        {doctor && bookedSlots !== undefined ? (
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
                        <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-gray-700">
                          <CalendarDays className="w-4 h-4 text-blue-500" />
                          Select Date
                        </h3>
                        <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50 shadow-sm">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={(date) =>
                              date < new Date().setHours(0, 0, 0, 0)
                            }
                            className="w-full"
                            classNames={{
                              months:
                                "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                              month: "space-y-4",
                              caption:
                                "flex justify-center pt-1 relative items-center",
                              caption_label:
                                "text-lg font-semibold text-gray-800",
                              nav: "space-x-1 flex items-center",
                              nav_button:
                                "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 opacity-50 hover:opacity-100",
                              nav_button_previous: "absolute left-1",
                              nav_button_next: "absolute right-1",
                              table: "w-full border-collapse space-y-1",
                              head_row: "flex",
                              head_cell:
                                "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] text-center text-gray-500 font-medium",
                              row: "flex w-full mt-2",
                              cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                              day: "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-selected:opacity-100 h-10 w-10 p-0 font-normal aria-selected:bg-blue-500 aria-selected:text-white hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600",
                              day_range_end: "day-range-end",
                              day_selected:
                                "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white font-semibold shadow-md",
                              day_today:
                                "bg-blue-100 text-blue-600 font-semibold",
                              day_outside:
                                "text-gray-400 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                              day_disabled:
                                "text-gray-300 opacity-50 cursor-not-allowed",
                              day_range_middle:
                                "aria-selected:bg-accent aria-selected:text-accent-foreground",
                              day_hidden: "invisible",
                            }}
                          />
                        </div>
                        {selectedDate && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">
                                Selected Date:
                              </span>
                            </div>
                            <p className="text-blue-800 font-semibold mt-1">
                              {selectedDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Time Slots */}
                      <div className="flex-1">
                        <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-blue-500" />
                          Select Time
                        </h3>
                        {selectedDate ? (
                          <div className="border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm">
                            <div className="p-4 border-b border-gray-100">
                              <p className="text-sm text-gray-600">
                                Available time slots
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Each appointment is 1 hour long
                              </p>
                            </div>
                            <ScrollArea className="h-[300px] p-4">
                              <div className="grid grid-cols-2 gap-3">
                                {timeSlots.map(({ time, isBooked }) => (
                                  <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    disabled={isBooked}
                                    className={`p-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium relative overflow-hidden ${
                                      isBooked
                                        ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200 opacity-60"
                                        : selectedTime === time
                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg transform"
                                        : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 text-gray-700 border-gray-300 hover:shadow-md hover:transform"
                                    }`}
                                  >
                                    <div className="flex flex-col items-center">
                                      <span className="font-semibold">
                                        {time}
                                      </span>
                                    </div>
                                    {!isBooked && selectedTime !== time && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </ScrollArea>
                            {selectedTime && (
                              <div className="p-4 bg-green-50 border-t border-green-200">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">
                                    Selected Time:
                                  </span>
                                </div>
                                <p className="text-green-800 font-semibold mt-1">
                                  {selectedTime} -{" "}
                                  {(parseInt(selectedTime.split(":")[0]) + 1)
                                    .toString()
                                    .padStart(2, "0")}
                                  :00
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-[380px] rounded-xl border-2 border-dashed border-gray-300 p-8 flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100">
                            <CalendarDays className="w-12 h-12 text-gray-400 mb-4" />
                            <p className="text-lg font-medium">
                              Select a date first
                            </p>
                            <p className="text-sm text-gray-400 mt-2 text-center">
                              Choose a date from the calendar to view available
                              time slots
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100"
                      disabled={!selectedTime || !selectedDate || loading}
                      onClick={handleAppointment}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Booking Appointment...</span>
                          </>
                        ) : (
                          <>
                            <CalendarDays className="w-5 h-5" />
                            <span>Book Appointment</span>
                            {selectedDate && selectedTime && (
                              <span className="ml-2 px-2 py-1 bg-white/20 rounded-md text-sm">
                                {selectedTime}
                              </span>
                            )}
                          </>
                        )}
                      </div>
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
                          {appointments.map((appointment, index) => (
                            <div
                              key={
                                appointment.date + appointment.startTime + index
                              }
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
}
