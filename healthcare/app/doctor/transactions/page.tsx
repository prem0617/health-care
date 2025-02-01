"use client";

import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpDown, Calendar, User, IndianRupee, Clock } from "lucide-react";
import DoctorLayout from "@/components/custom/DoctorLayout";

interface DecodedToken {
  doctorId: string;
  name: string;
}

interface Transaction {
  _id: string;
  amount: number;
  createdAt: string;
  userId: {
    profile: {
      firstName: string;
      lastName: string;
      phone: string;
    };
    email: string;
  };
  appointmentId: {
    date: string;
    slot: string;
    status: string;
    isFirstConsultation: boolean;
  };
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchTransactions = async (doctorId: string) => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/transactions/doctor/${doctorId}`
        );
        const result = await response.json();
        console.log(doctorId);
        if (response.ok) {
          setTransactions(result.data.transactions);
          // Calculate total amount
          const total = result.data.transactions.reduce(
            (sum: number, tx: Transaction) => sum + tx.amount,
            0
          );
          setTotalAmount(total);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem("doctorToken");
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      console.log(decodedToken);

      fetchTransactions(decodedToken.doctorId);
    }
  }, []);

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <div className="p-8">
          <div className="bg-red-50 p-4 rounded-lg text-red-600">{error}</div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
          <Card className="bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <IndianRupee className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-700">
                    {totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>Patient</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Appointment</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Slot</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    <div className="flex items-center space-x-1">
                      <ArrowUpDown className="h-4 w-4" />
                      <span>Amount</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.userId.profile.firstName}{" "}
                          {transaction.userId.profile.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.userId.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.userId.profile.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-gray-900">
                          {new Date(
                            transaction.appointmentId.date
                          ).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.appointmentId.isFirstConsultation
                            ? "First Consultation"
                            : "Follow-up"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-sm rounded-full bg-blue-50 text-blue-600">
                        {transaction.appointmentId.slot}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-semibold text-gray-900">
                        ${transaction.amount}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default Transactions;
