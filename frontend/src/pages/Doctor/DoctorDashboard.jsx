import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

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

import { BACKEND_URL } from "@/config";
import DoctorLayout from "./DoctorLayout";

const EmptyState = ({ message }) => (
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

const DoctorDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [previousAppointments, setPreviousAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [zoomLink, setZoomLink] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medications, setMedications] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false);
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] =
    useState(false);

  useEffect(() => {
    const token = localStorage.getItem("doctorToken");
    if (token) {
      console.log(token);
      const decoded = jwtDecode(token);
      setDoctorName(decoded.name || "Doctor");
      fetchAppointments(decoded.doctorId);
    }
  }, []);

  const fetchAppointments = async (doctorId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("doctorToken");
      if (!token) return;
      const res = await axios.get(
        `${BACKEND_URL}/api/appointments/doctor/${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(res);
      const { upcomingAppointments, previousAppointments } = res.data.data;
      setUpcomingAppointments(upcomingAppointments || []);
      setPreviousAppointments(previousAppointments || []);
    } catch (err) {
      console.error(err);
      setUpcomingAppointments([]);
      setPreviousAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openZoomDialog = (app) => {
    setSelectedAppointment(app);
    setZoomLink(app.zoomLink || "");
    setIsZoomDialogOpen(true);
  };

  const openPrescriptionDialog = (app) => {
    setSelectedAppointment(app);
    setDiagnosis("");
    setMedications([]);
    setIsPrescriptionDialogOpen(true);
  };

  const handleAddOrUpdateZoomLink = async () => {
    if (!selectedAppointment) return;
    try {
      const token = localStorage.getItem("doctorToken");
      await axios.post(
        `${BACKEND_URL}/api/appointments/${selectedAppointment._id}/zoom-link`,
        { zoomLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUpcomingAppointments((prev) =>
        prev.map((app) =>
          app._id === selectedAppointment._id ? { ...app, zoomLink } : app
        )
      );
      setIsZoomDialogOpen(false);
      setZoomLink("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePrescription = async () => {
    if (!selectedAppointment) return;
    try {
      const token = localStorage.getItem("doctorToken");
      await axios.post(
        `${BACKEND_URL}/api/prescription`,
        { diagnosis, medications, appointmentId: selectedAppointment._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreviousAppointments((prev) =>
        prev.map((app) =>
          app._id === selectedAppointment._id
            ? { ...app, hasPrescription: true }
            : app
        )
      );
      setIsPrescriptionDialogOpen(false);
      setDiagnosis("");
      setMedications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const renderAppointmentCard = (app, isUpcoming) => (
    <Card
      key={app._id}
      className="hover:shadow-lg transition-shadow duration-300 ease-in-out bg-white"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start justify-between space-y-5 gap-4 sm:gap-0">
          <div className="space-y-2 sm:space-y-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700 font-medium">
                {formatDate(app.date)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600">
                {app.patientId.profile.firstName}{" "}
                {app.patientId.profile.lastName}
              </span>
            </div>
          </div>
          <div className="flex flex-col space-y-2 w-full sm:w-auto">
            {isUpcoming && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openZoomDialog(app)}
              >
                {app.zoomLink ? (
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
            {!isUpcoming && !app.prescriptionId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openPrescriptionDialog(app)}
              >
                <FileSignature className="w-4 h-4 mr-2" />
                Add Prescription
              </Button>
            )}
            {!isUpcoming && app.prescriptionId && (
              <span className="inline-flex justify-center items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                Prescription Added
              </span>
            )}
          </div>
        </div>
        {app.isFirstConsultation && (
          <span className="inline-flex px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs mt-2">
            First Visit
          </span>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DoctorLayout>
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome back, Dr!
        </h1>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Upcoming Appointments
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 mb-8">
          {isLoading ? (
            <LoadingState />
          ) : upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((app) => renderAppointmentCard(app, true))
          ) : (
            <EmptyState message="No Upcoming Appointments" />
          )}
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Previous Appointments
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <LoadingState />
          ) : previousAppointments.length > 0 ? (
            previousAppointments.map((app) => renderAppointmentCard(app, false))
          ) : (
            <EmptyState message="No Previous Appointments" />
          )}
        </div>

        {/* Zoom Dialog */}
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
            <Button onClick={handleAddOrUpdateZoomLink}>Save</Button>
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
            {medications.map((med, idx) => (
              <div key={idx} className="space-y-2">
                <Input
                  placeholder="Medicine name"
                  value={med.name}
                  onChange={(e) =>
                    setMedications((meds) => {
                      const copy = [...meds];
                      copy[idx].name = e.target.value;
                      return copy;
                    })
                  }
                />
                <Input
                  placeholder="Dosage"
                  value={med.dosage}
                  onChange={(e) =>
                    setMedications((meds) => {
                      const copy = [...meds];
                      copy[idx].dosage = e.target.value;
                      return copy;
                    })
                  }
                />
                <Input
                  placeholder="Frequency"
                  value={med.frequency}
                  onChange={(e) =>
                    setMedications((meds) => {
                      const copy = [...meds];
                      copy[idx].frequency = e.target.value;
                      return copy;
                    })
                  }
                />
                <Input
                  placeholder="Duration"
                  value={med.duration}
                  onChange={(e) =>
                    setMedications((meds) => {
                      const copy = [...meds];
                      copy[idx].duration = e.target.value;
                      return copy;
                    })
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
            <Button onClick={handleCreatePrescription}>
              Send Prescription
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
