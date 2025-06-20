import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, CreditCard, User, FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BACKEND_URL } from "@/config";
import PrescriptionDisplay from "@/components/custom/PrescriptionDisplay";

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

const UpcomingAppointments = () => {
  const [transactions, setTransactions] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isAppointmentPassed = (date) => {
    return new Date(date) < new Date();
  };

  const fetchUserAppointment = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/transactions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/prescription/getMedicine`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setPrescriptions(data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchUserAppointment();
      fetchPrescriptions();
    }
  }, [isClient]);

  const getPrescriptionByAppointmentId = (appointmentId) => {
    return prescriptions.find(p => p.appointmentId === appointmentId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Appointment</h1>
        <div className="space-y-6">
          {transactions.map((transaction) => {
            const prescription = getPrescriptionByAppointmentId(transaction.appointmentId._id);
            const appointmentPassed = isAppointmentPassed(transaction.appointmentId.date);
            const hasZoomLink = transaction.appointmentId.zoomLink;

            return (
              <Card key={transaction._id} className="overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Transaction ID: {transaction._id}
                      </p>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      {hasZoomLink && !appointmentPassed && (
                        <Popover>
                          <PopoverTrigger className="bg-blue-200 text-blue-700 px-3 py-1 rounded-md">
                            Get Zoom Link
                          </PopoverTrigger>
                          <PopoverContent>{transaction.appointmentId.zoomLink}</PopoverContent>
                        </Popover>
                      )}
                      {prescription && (
                        <Popover>
                          <PopoverTrigger className="bg-green-200 text-green-700 px-3 py-1 rounded-md">
                            View Prescription
                          </PopoverTrigger>
                          <PopoverContent>
                            <PrescriptionDisplay prescription={prescription} />
                          </PopoverContent>
                        </Popover>
                      )}
                      {!hasZoomLink && !prescription && (
                        <span className="text-gray-500">No Details Available</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Transaction Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CreditCard className="w-4 h-4" />
                          <span>Type: {transaction.type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarDays className="w-4 h-4" />
                          <span>Created: {formatDate(transaction.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointment Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <div>
                            <span className="font-medium">
                              Dr. {transaction.appointmentId.doctorId.name}
                            </span>
                            <span className="text-gray-500 ml-1">
                              ({transaction.appointmentId.doctorId.specialization})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {transaction.appointmentId.slot.startTime} - {transaction.appointmentId.slot.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarDays className="w-4 h-4" />
                          <span>Date: {formatDate(transaction.appointmentId.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span>
                            {transaction.appointmentId.isFirstConsultation
                              ? "First Consultation"
                              : "Follow-up Consultation"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div>
                        Original Amount: {formatCurrency(transaction.metadata.originalAmount, transaction.currency)}
                      </div>
                      <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UpcomingAppointments;
