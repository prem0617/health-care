"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, CreditCard, User, FileText } from "lucide-react";

interface Transaction {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  appointmentId: {
    _id: string;
    date: string;
    doctorId: {
      _id: string;
      name: string;
      specialization: string;
    };
    isFirstConsultation: boolean;
    patientId: string;
    payment: {
      originalAmount: number;
      discountApplied: number;
      finalAmount: number;
      currency: string;
    };
    slot: {
      startTime: string;
      endTime: string;
    };
    status: string;
    updatedAt: string;
    __v: number;
  };
  doctorId: string;
  userId: string;
  metadata: {
    discountApplied: number;
    originalAmount: number;
  };
  __v: number;
}

const getStatusColor = (status: string) => {
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const Page = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchUserAppointment = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/transactions", {
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

  useEffect(() => {
    fetchUserAppointment();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Appointment</h1>
        <div className="space-y-6">
          {transactions.map((transaction) => (
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
                  {/* <Badge
                    className={`${getStatusColor(
                      transaction.status
                    )} px-3 py-1 rounded-full text-sm font-medium`}
                  >
                    {transaction.status}
                  </Badge> */}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Transaction Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        <span>Type: {transaction.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarDays className="w-4 h-4" />
                        <span>
                          Created: {formatDate(transaction.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Appointment Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <div>
                          <span className="font-medium">
                            Dr. {transaction.appointmentId.doctorId.name}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({transaction.appointmentId.doctorId.specialization}
                            )
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {transaction.appointmentId.slot.startTime} -{" "}
                          {transaction.appointmentId.slot.endTime}
                        </span>
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
                      Original Amount:{" "}
                      {formatCurrency(
                        transaction.metadata.originalAmount,
                        transaction.currency
                      )}
                      {transaction.metadata.discountApplied > 0 && (
                        <span className="ml-2 text-green-600">
                          (Discount:{" "}
                          {formatCurrency(
                            transaction.metadata.discountApplied,
                            transaction.currency
                          )}
                          )
                        </span>
                      )}
                    </div>
                    <div>
                      Appointment Status:
                      <Badge className="ml-2 bg-blue-100 text-blue-800">
                        {transaction.appointmentId.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
