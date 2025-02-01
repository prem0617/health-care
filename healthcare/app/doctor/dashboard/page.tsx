"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Activity, Users, FileText } from "lucide-react";
import type { Appointment, BookedSlot } from "@/lib/types";
import DoctorLayout from "@/components/custom/DoctorLayout";
// import DoctorLayout from "@/components/DoctorLayout"; // Import the layout

interface DecodedToken {
  email?: string;
  doctorId: string;
  name?: string;
}

const DoctorDashboard = () => {
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorName, setDoctorName] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("doctorToken");
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      setDoctorName(decodedToken.name || "Doctor");
      fetchAppointments(decodedToken.doctorId);
    }
  }, []);

  const fetchAppointments = async (userId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/appointments/doctor/${userId}`
      );
      const appointmentsData = response.data.data?.appointments || [];
      setBookedSlots(
        appointmentsData.map((appointment: any) => ({
          date: appointment.date.split("T")[0],
          startTime: appointment.slot.startTime,
        }))
      );
      setAppointments(
        appointmentsData.map((appointment: any) => ({
          date: appointment.date,
          startTime: appointment.slot.startTime,
          patientName: `${appointment.patientId.profile.firstName} ${appointment.patientId.profile.lastName}`,
          isFirstConsultation: appointment.isFirstConsultation,
        }))
      );
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <DoctorLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome back, Dr. {doctorName}!
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Appointments
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Patients
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter((app) => app.isFirstConsultation).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Today
              </CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  appointments.filter(
                    (app) =>
                      new Date(app.date).toDateString() ===
                      new Date().toDateString()
                  ).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Upcoming Appointments
        </h2>
        <div className="space-y-4">
          {appointments.map((appointment, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-300 ease-in-out"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-700 font-medium">
                        {formatDate(appointment.date)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">
                        {appointment.startTime}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-purple-500" />
                      <span className="text-gray-600">
                        {appointment.patientName}
                      </span>
                    </div>
                  </div>
                  {appointment.isFirstConsultation && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      First Visit
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
