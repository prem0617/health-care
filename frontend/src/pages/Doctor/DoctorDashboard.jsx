"use client";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { motion } from "framer-motion";

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
  Clock,
  Plus,
  CheckCircle,
  Stethoscope,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";

import { BACKEND_URL } from "@/config";
import DoctorLayout from "./DoctorLayout";

const StatsCard = ({ icon, title, value, trend, color = "blue" }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 bg-gradient-to-br from-${color}-100 to-${color}-200 rounded-xl flex items-center justify-center`}
            >
              <span className={`text-${color}-600`}>{icon}</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          {trend && (
            <div className="flex items-center space-x-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">{trend}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const EmptyState = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="col-span-full"
  >
    <Card className="border-0 shadow-none bg-gradient-to-br from-slate-50 to-slate-100">
      <CardContent className="p-8 sm:p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6"
          >
            <CalendarX className="w-10 h-10 text-blue-500" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {message}
          </h3>
          <p className="text-gray-500 max-w-sm">
            No appointments found at this time. Your schedule is clear for now.
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const LoadingState = () => (
  <div className="col-span-full flex justify-center items-center p-12">
    <div className="flex flex-col items-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4"
      >
        <Loader2 className="w-8 h-8 text-blue-600" />
      </motion.div>
      <p className="text-gray-600 font-medium">Loading appointments...</p>
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
      fetchAppointments(decoded.userId);
    }
  }, []);

  const fetchAppointments = async (doctorId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("doctorToken");
      if (!token) return;
      const res = await axios.get(
        `${BACKEND_URL}/api/appointments/doctor/${doctorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
    <motion.div
      key={app._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r "></div>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            {/* Patient Info Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center"
                >
                  <User className="w-6 h-6 text-blue-600" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {app.patientId.profile.firstName}{" "}
                    {app.patientId.profile.lastName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatDate(app.date)}
                    </span>
                  </div>
                </div>
              </div>
              {app.isFirstConsultation && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs font-medium border border-emerald-200"
                >
                  <Stethoscope className="w-3 h-3 mr-1" />
                  First Visit
                </motion.span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
              {isUpcoming && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openZoomDialog(app)}
                  className="w-full justify-start bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200"
                >
                  {app.zoomLink ? (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Meeting Link
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Add Meeting Link
                    </>
                  )}
                </Button>
              )}
              {!isUpcoming && !app.prescriptionId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPrescriptionDialog(app)}
                  className="w-full justify-start bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100 hover:border-purple-300 transition-all duration-200"
                >
                  <FileSignature className="w-4 h-4 mr-2" />
                  Create Prescription
                </Button>
              )}
              {!isUpcoming && app.prescriptionId && (
                <div className="flex items-center justify-center py-2 px-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-green-700 font-medium text-sm">
                    Prescription Completed
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const totalAppointments =
    upcomingAppointments.length + previousAppointments.length;
  const completedAppointments = previousAppointments.length;
  const prescriptionsGiven = previousAppointments.filter(
    (app) => app.prescriptionId
  ).length;

  return (
    <DoctorLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-6 lg:p-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-4 mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Stethoscope className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Welcome back, Dr. {doctorName}
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your appointments and patient care
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          >
            <StatsCard
              icon={<Users className="w-6 h-6" />}
              title="Total Appointments"
              value={totalAppointments}
              color="blue"
            />
            <StatsCard
              icon={<Activity className="w-6 h-6" />}
              title="Completed"
              value={completedAppointments}
              color="green"
            />
            <StatsCard
              icon={<FileSignature className="w-6 h-6" />}
              title="Prescriptions Given"
              value={prescriptionsGiven}
              color="purple"
            />
          </motion.div>

          {/* Upcoming Appointments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Upcoming Appointments
              </h2>
              {!isLoading && upcomingAppointments.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  {upcomingAppointments.length} scheduled
                </span>
              )}
            </div>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {isLoading ? (
                <LoadingState />
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((app) =>
                  renderAppointmentCard(app, true)
                )
              ) : (
                <EmptyState message="No Upcoming Appointments" />
              )}
            </div>
          </motion.div>

          {/* Previous Appointments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Previous Appointments
              </h2>
              {!isLoading && previousAppointments.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                  {previousAppointments.length} completed
                </span>
              )}
            </div>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {isLoading ? (
                <LoadingState />
              ) : previousAppointments.length > 0 ? (
                previousAppointments.map((app) =>
                  renderAppointmentCard(app, false)
                )
              ) : (
                <EmptyState message="No Previous Appointments" />
              )}
            </div>
          </motion.div>
        </div>

        {/* Enhanced Zoom Dialog */}
        <Dialog open={isZoomDialogOpen} onOpenChange={setIsZoomDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-blue-600" />
                <span>
                  {selectedAppointment?.zoomLink
                    ? "Update Meeting Link"
                    : "Add Meeting Link"}
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Enter Zoom or meeting link"
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex space-x-3">
                <Button
                  onClick={handleAddOrUpdateZoomLink}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Save Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsZoomDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Prescription Dialog */}
        <Dialog
          open={isPrescriptionDialogOpen}
          onOpenChange={setIsPrescriptionDialogOpen}
        >
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileSignature className="w-5 h-5 text-purple-600" />
                <span>Create Prescription</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis
                </label>
                <Textarea
                  placeholder="Enter patient diagnosis..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={3}
                  className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Medications
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMedications([
                        ...medications,
                        { name: "", dosage: "", frequency: "", duration: "" },
                      ])
                    }
                    className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Medication
                  </Button>
                </div>

                <div className="space-y-4">
                  {medications.map((med, idx) => (
                    <Card
                      key={idx}
                      className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <Input
                          placeholder="Dosage (e.g., 500mg)"
                          value={med.dosage}
                          onChange={(e) =>
                            setMedications((meds) => {
                              const copy = [...meds];
                              copy[idx].dosage = e.target.value;
                              return copy;
                            })
                          }
                          className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <Input
                          placeholder="Frequency (e.g., 2x daily)"
                          value={med.frequency}
                          onChange={(e) =>
                            setMedications((meds) => {
                              const copy = [...meds];
                              copy[idx].frequency = e.target.value;
                              return copy;
                            })
                          }
                          className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <Input
                          placeholder="Duration (e.g., 7 days)"
                          value={med.duration}
                          onChange={(e) =>
                            setMedications((meds) => {
                              const copy = [...meds];
                              copy[idx].duration = e.target.value;
                              return copy;
                            })
                          }
                          className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  onClick={handleCreatePrescription}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Send Prescription
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsPrescriptionDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
