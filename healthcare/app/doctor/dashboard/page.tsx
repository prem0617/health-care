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
import {
  Calendar,
  User,
  Video,
  FileSignature,
  Edit,
  Loader2,
  CalendarX,
} from "lucide-react";
import type { Appointment } from "@/lib/types";
import DoctorLayout from "@/components/custom/DoctorLayout";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://health-care-j1k8.onrender.com";

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

const EmptyState = ({ message }: { message: string }) => (
  <Card className="col-span-full p-4 sm:p-6">
    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6">
      <CalendarX className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" />
      <h3 className="text-base sm:text-lg font-medium text-gray-900">
        {message}
      </h3>
      <p className="text-sm sm:text-base text-gray-500 mt-2">
        No appointments found at this time.
      </p>
    </div>
  </Card>
);

const LoadingState = () => (
  <div className="col-span-full flex justify-center items-center p-6 sm:p-12">
    <div className="flex flex-col items-center">
      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 animate-spin mb-3 sm:mb-4" />
      <p className="text-sm sm:text-base text-gray-600">
        Loading appointments...
      </p>
    </div>
  </div>
);

const DoctorDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(true);
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
      setUpcomingAppointments([]);
      setPreviousAppointments([]);
    } finally {
      setIsLoading(false);
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
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start justify-between space-y-5 gap-4 sm:gap-0">
          <div className="space-y-2 sm:space-y-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-700 font-medium">
                {formatDate(appointment.date)}
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-600">
                {appointment.patientId.profile.firstName +
                  " " +
                  appointment.patientId.profile.lastName}
              </span>
            </div>
          </div>
          <div className="flex flex-col space-y-2 w-full sm:w-auto">
            {isUpcoming && (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-sm"
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
            {!isUpcoming && !appointment.prescriptionId && (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-sm"
                onClick={() => openPrescriptionDialog(appointment)}
              >
                <FileSignature className="w-4 h-4 mr-2" />
                Add Prescription
              </Button>
            )}
            {!isUpcoming && appointment.prescriptionId && (
              <span className="inline-flex w-full sm:w-[145px] justify-center items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
                Prescription Added
              </span>
            )}
          </div>
        </div>
        {appointment.isFirstConsultation && (
          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 mt-2">
            First Visit
          </span>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DoctorLayout>
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 lg:mb-8">
          Welcome back, Dr!
        </h1>

        {/* Upcoming Appointments */}
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
          Upcoming Appointments
        </h2>
        <div className="grid gap-3 sm:gap-4 mb-6 sm:mb-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <LoadingState />
          ) : upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) =>
              renderAppointmentCard(appointment, true)
            )
          ) : (
            <EmptyState message="No Upcoming Appointments" />
          )}
        </div>

        {/* Previous Appointments */}
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
          Previous Appointments
        </h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <LoadingState />
          ) : previousAppointments.length > 0 ? (
            previousAppointments.map((appointment) =>
              renderAppointmentCard(appointment, false)
            )
          ) : (
            <EmptyState message="No Previous Appointments" />
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
