import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, Plus, CreditCard, TrendingUp, Clock, User, ArrowUpRight, ArrowDownLeft, Shield } from "lucide-react";
import { BACKEND_URL } from "@/config";

// Mock BACKEND_URL for demo

const WalletPage = () => {
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [wallet, setWallet] = useState({ balance: 2450.75, currency: "INR" });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchWalletDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/getUser`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setWallet(data.user.wallet);
    } catch (error) {
      console.log(error);
      showNotification("error", "Failed to fetch wallet details");
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/transactions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.log(error);
      showNotification("error", "Failed to fetch transactions");
    }
  };

  useEffect(() => {
    fetchWalletDetails();
    fetchTransactions();
  }, []);

  const handleRecharge = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/updateWallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ amount: Number(amount), pin }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification("success", "Wallet recharged successfully");
        setIsRechargeOpen(false);
        setAmount("");
        setPin("");
        fetchWalletDetails();
        fetchTransactions();
      }
    } catch (error) {
      console.log(error);
      showNotification("error", "Failed to recharge wallet");
    }
    setLoading(false);
  };

  const formatTransactionType = (type) => {
    switch(type) {
      case "appointment_payment":
        return "Appointment Payment";
      case "wallet_credit":
        return "Wallet Credit";
      default:
        return type.replace("_", " ");
    }
  };

  const getTransactionIcon = (type) => {
    switch(type) {
      case "appointment_payment":
        return <User className="w-4 h-4" />;
      case "wallet_credit":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 pt-[100px] ">
        

        {/* Notification */}
        {notification && (
          <Alert
            className={`mb-6 ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <AlertDescription className="font-medium">{notification.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mt-[50px]">
          {/* Left Column - Wallet Balance */}
          <div className="lg:col-span-1">
            {/* Main Balance Card */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  My Wallet
                </h1>
              </div>
              <p className="text-gray-600">Manage your digital wallet and view transaction history</p>
            </div>
            <Card className="shadow-lg bg-blue-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-medium">Wallet Balance</CardTitle>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div>
                    <div className="text-4xl font-bold text-white mb-1">
                      ₹{wallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-white/80 text-sm">Available Balance</div>
                  </div>
                  
                  <Button 
                    onClick={() => setIsRechargeOpen(true)} 
                    className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Money
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Transactions */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg bg-white">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-gray-900">Recent Transactions</CardTitle>
                  </div>
                  <div className="text-sm text-gray-500">
                    {transactions.length} transactions
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <div className="divide-y divide-gray-100">
                    {transactions.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto mb-4">
                          <CreditCard className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No transactions yet</p>
                        <p className="text-gray-400 text-sm">Your transaction history will appear here</p>
                      </div>
                    ) : (
                      transactions.map((transaction) => (
                        <div
                          key={transaction._id}
                          className="p-4 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-100 rounded-lg">
                                <User className="w-4 h-4 text-red-600" />
                              </div>
                              
                              <div>
                                <p className="font-medium text-gray-900 mb-1">
                                  {transaction.type === "appointment_payment"
                                    ? `Payment to Dr. ${transaction.appointmentId.doctorId.name}`
                                    : formatTransactionType(transaction.type)}
                                </p>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right text-red-600">
                              <div className="text-lg font-bold">
                                -₹{transaction.amount.toLocaleString('en-IN')}
                              </div>
                              <div className="text-xs text-red-500">
                                Debit
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recharge Dialog */}
        <Dialog open={isRechargeOpen} onOpenChange={setIsRechargeOpen}>
          <DialogContent className="shadow-2xl bg-white">
            <DialogHeader className="text-center pb-6">
              <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-4">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Add Money to Wallet
              </DialogTitle>
              <p className="text-gray-500 mt-2">Enter the amount and your PIN to recharge your wallet</p>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Amount (INR)
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security PIN
                </label>
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors"
                />
              </div>
              
              <Button
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
                onClick={handleRecharge}
                disabled={loading || !amount || !pin}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add ₹{amount || "0"} to Wallet
                  </div>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WalletPage;