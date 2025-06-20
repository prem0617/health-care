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
import { BACKEND_URL } from "../config";

const WalletPage = () => {
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [wallet, setWallet] = useState({ balance: 0, currency: "INR" });
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

  return (
    <div className="container mx-auto p-4 mt-[100px]">
      {notification && (
        <Alert
          className={`mb-4 ${
            notification.type === "success"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₹{wallet.balance.toFixed(2)}
              </div>
              <Button onClick={() => setIsRechargeOpen(true)} className="mt-4 w-full">
                Recharge Wallet
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {transaction.type === "appointment_payment"
                          ? `Payment to Dr. ${transaction.appointmentId.doctorId.name}`
                          : transaction.type.replace("_", " ")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`font-bold ${
                        transaction.type === "wallet_credit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "wallet_credit" ? "+" : "-"}₹{transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isRechargeOpen} onOpenChange={setIsRechargeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recharge Wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Amount (INR)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="text-sm font-medium">PIN</label>
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleRecharge}
                disabled={loading || !amount || !pin}
              >
                {loading ? "Processing..." : "Recharge"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WalletPage;