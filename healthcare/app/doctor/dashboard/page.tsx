"use client";
import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, User, Video, FileSignature, Edit } from "lucide-react";
import type { Appointment } from "@/lib/types";
import DoctorLayout from "@/components/custom/DoctorLayout";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface DecodedToken {
  email?: string;
  doctorId: string;
  name?: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const DoctorDashboard: React.FC = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [previousAppointments, setPreviousAppointments] = useState<
    Appointment[]
  >([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [zoomLink, setZoomLink] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doctorName, setDoctorName] = useState<string>("");
  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState<boolean>(false);
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] =
    useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("doctorToken");
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      setDoctorName(decodedToken.name || "Doctor");
      fetchAppointments(decodedToken.doctorId);
    }
  }, []);

  const fetchAppointments = async (doctorId: string) => {
    try {
      const token = localStorage.getItem("doctorToken");
      if (!token) return;

      const response = await axios.get(
        `${BACKEND_URL}/api/appointments/doctor/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        const { upcomingAppointments, previousAppointments } =
          response.data.data;
        setUpcomingAppointments(upcomingAppointments);
        setPreviousAppointments(previousAppointments);
      } else {
        setUpcomingAppointments([]);
        setPreviousAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleAddOrUpdateZoomLink = async () => {
    if (!selectedAppointment) return;
    try {
      await axios.post(
        `${BACKEND_URL}/api/appointments/${selectedAppointment._id}/zoom-link`,
        { zoomLink },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("doctorToken")}`,
          },
        }
      );
      setUpcomingAppointments(
        upcomingAppointments.map((app) =>
          app._id === selectedAppointment._id ? { ...app, zoomLink } : app
        )
      );
      setSelectedAppointment(null);
      setZoomLink("");
      setIsZoomDialogOpen(false);
    } catch (error) {
      console.error("Error adding/updating Zoom link:", error);
    }
  };

  const handleCreatePrescription = async () => {
    if (!selectedAppointment) return;

    try {
      const token = localStorage.getItem("doctorToken");
      if (!token) return;
      console.log(token);
      const decodedToken: DecodedToken = jwtDecode(token);
      console.log(medications);
      console.log(decodedToken);
      console.log({
        diagnosis,
        medications: medications,
        appointmentId: selectedAppointment._id,
      });
      const response = await axios.post(
        `${BACKEND_URL}/api/prescription`,
        {
          diagnosis,
          medications: medications,
          appointmentId: selectedAppointment._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("doctorToken")}`,
          },
        }
      );

      console.log(response);

      setPreviousAppointments(
        previousAppointments.map((app) =>
          app._id === selectedAppointment._id
            ? { ...app, hasPrescription: true }
            : app
        )
      );

      setSelectedAppointment(null);
      setDiagnosis("");
      setMedications([]);
      setIsPrescriptionDialogOpen(false);
    } catch (error) {
      console.error("Error creating prescription:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  const openZoomDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setZoomLink(appointment.zoomLink || "");
    setIsZoomDialogOpen(true);
  };

  const openPrescriptionDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDiagnosis("");
    setMedications([]);
    setIsPrescriptionDialogOpen(true);
  };

  const renderAppointmentCard = (
    appointment: Appointment,
    isUpcoming: boolean
  ) => (
    <Card
      key={appointment._id}
      className="hover:shadow-lg transition-shadow duration-300 ease-in-out bg-white"
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
              <User className="w-5 h-5 text-purple-500" />
              <span className="text-gray-600">
                {appointment.patientId.profile.firstName +
                  " " +
                  appointment.patientId.profile.lastName}
              </span>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            {isUpcoming && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openZoomDialog(appointment)}
              >
                {appointment.zoomLink ? (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Zoom Link
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Add Zoom Link
                  </>
                )}
              </Button>
            )}
            {!isUpcoming && !appointment.hasPrescription && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openPrescriptionDialog(appointment)}
              >
                <FileSignature className="w-4 h-4 mr-2" />
                Add Prescription
              </Button>
            )}
          </div>
        </div>
        {appointment.isFirstConsultation && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2">
            First Visit
          </span>
        )}
      </CardContent>
    </Card>
  );

  console.log(upcomingAppointments);

  return (
    <DoctorLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Welcome back, Dr!
        </h1>

        {/* Upcoming Appointments */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Upcoming Appointments
        </h2>
        <div className="grid gap-4 mb-8 md:grid-cols-2 lg:grid-cols-3">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) =>
              renderAppointmentCard(appointment, true)
            )
          ) : (
            <div>No Upcoming Appointment</div>
          )}
        </div>

        {/* Previous Appointments */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Previous Appointments
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {previousAppointments.length > 0 ? (
            previousAppointments.map((appointment) =>
              renderAppointmentCard(appointment, false)
            )
          ) : (
            <div>No Previous Appointment</div>
          )}
        </div>
      </div>

      {/* Zoom Link Dialog */}
      <Dialog open={isZoomDialogOpen} onOpenChange={setIsZoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment?.zoomLink
                ? "Update Zoom Link"
                : "Add Zoom Link"}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter Zoom link"
            value={zoomLink}
            onChange={(e) => setZoomLink(e.target.value)}
          />
          <Button onClick={handleAddOrUpdateZoomLink}>
            {selectedAppointment?.zoomLink ? "Update" : "Save"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog
        open={isPrescriptionDialogOpen}
        onOpenChange={setIsPrescriptionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Prescription</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            rows={3}
          />
          {medications.map((med, index) => (
            <div key={index} className="space-y-2">
              <Input
                placeholder="Medicine name"
                value={med.name}
                onChange={(e) =>
                  setMedications(
                    medications.map((m, i) =>
                      i === index ? { ...m, name: e.target.value } : m
                    )
                  )
                }
              />
              <Input
                placeholder="Dosage"
                value={med.dosage}
                onChange={(e) =>
                  setMedications(
                    medications.map((m, i) =>
                      i === index ? { ...m, dosage: e.target.value } : m
                    )
                  )
                }
              />
              <Input
                placeholder="Frequency"
                value={med.frequency}
                onChange={(e) =>
                  setMedications(
                    medications.map((m, i) =>
                      i === index ? { ...m, frequency: e.target.value } : m
                    )
                  )
                }
              />
              <Input
                placeholder="Duration"
                value={med.duration}
                onChange={(e) =>
                  setMedications(
                    medications.map((m, i) =>
                      i === index ? { ...m, duration: e.target.value } : m
                    )
                  )
                }
              />
            </div>
          ))}
          <Button
            onClick={() =>
              setMedications([
                ...medications,
                { name: "", dosage: "", frequency: "", duration: "" },
              ])
            }
          >
            Add Medication
          </Button>
          <Button onClick={handleCreatePrescription}>Send Prescription</Button>
        </DialogContent>
      </Dialog>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
