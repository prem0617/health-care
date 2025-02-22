"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DoctorLayout from "@/components/custom/DoctorLayout";
import { Button } from "@/components/ui/button";

interface DecodedToken {
  email?: string;
  doctorId: string;
  name?: string;
  specialization?: string;
}

interface Question {
  question: string;
  aiResponse: {
    analysis: string;
    timestamp: string;
  };
  isChecked: boolean;
  createdAt: string;
  _id: string;
  specialization: string;
}

const DoctorDashboard = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [doctorData, setDoctorData] = useState<DecodedToken>({
    email: "",
    doctorId: "",
    name: "",
    specialization: "",
  });
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [updatedAnswer, setUpdatedAnswer] = useState<string>("");
  const [loading, setLoading] = useState<Boolean>(true);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      if (!doctorData.specialization) {
        return null;
      }

      const response = await axios.post(
        "https://health-care-j1k8.onrender.com/api/verifyChat/chat-history",
        { specialization: doctorData.specialization }
      );

      // Handle the new data format
      if (response.data?.data) {
        setQuestions(response?.data?.data);
      }

      // console.log(response);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("doctorToken");
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      setDoctorData(decodedToken);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [doctorData]);

  // console.log(questions);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleVerifyChat = async (questionId: string) => {
    try {
      const token = localStorage.getItem("doctorToken");
      const response = await axios.put(
        `https://health-care-j1k8.onrender.com/api/verifyChat/verify-chat/${questionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the UI locally
      setQuestions((prevQuestions) =>
        prevQuestions.map((question) =>
          question._id === questionId
            ? { ...question, isChecked: true }
            : question
        )
      );
    } catch (error) {
      console.error("Error verifying question:", error);
    }
  };

  const handleUpdateAnswer = async (questionId: string) => {
    if (!updatedAnswer) {
      alert("Please provide an updated answer.");
      return;
    }

    try {
      const token = localStorage.getItem("doctorToken");
      const response = await axios.put(
        `https://health-care-j1k8.onrender.com/api/verifyChat/update-answer/${questionId}`,
        { answer: updatedAnswer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the UI locally
      setQuestions((prevQuestions) =>
        prevQuestions.map((question) =>
          question._id === questionId
            ? {
                ...question,
                aiResponse: {
                  ...question.aiResponse,
                  analysis: updatedAnswer,
                },
              }
            : question
        )
      );

      // Clear the editing state
      setEditingQuestion(null);
      setUpdatedAnswer("");
    } catch (error) {
      console.error("Error updating answer:", error);
      alert("Error updating the answer. Please try again.");
    }
  };

  // console.log(loading);

  return (
    <DoctorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

        <div className="mt-6 space-y-6">
          <h2 className="text-xl font-medium text-gray-800">Questions</h2>

          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : questions.length > 0 ? (
            questions.map((question) => (
              <Card key={question._id} className="shadow-md bg-white p-4">
                <CardHeader>
                  <CardTitle className="font-semibold text-lg text-gray-700 flex justify-between">
                    Question Details
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {formatDate(question.createdAt)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mt-4">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium text-gray-800">
                        Q: {question.question}
                      </div>

                      {!question.isChecked && (
                        <Button
                          className="bg-blue-700 hover:bg-blue-800"
                          onClick={() => handleVerifyChat(question._id)}
                        >
                          Verify Question
                        </Button>
                      )}
                    </div>
                    <div className="mt-2 text-gray-600">
                      <p>
                        A:
                        {editingQuestion === question._id ? (
                          <textarea
                            value={updatedAnswer}
                            onChange={(e) => setUpdatedAnswer(e.target.value)}
                            className="border p-2 w-full"
                          />
                        ) : (
                          question.aiResponse.analysis
                        )}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {question.isChecked ? "Checked" : "Unchecked"}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      <span>{formatDate(question.createdAt)}</span>
                    </div>

                    {editingQuestion === question._id ? (
                      <div className="mt-2">
                        <Button
                          className="bg-green-700 hover:bg-green-800"
                          onClick={() => handleUpdateAnswer(question._id)}
                        >
                          Save Answer
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="bg-yellow-700 hover:bg-yellow-800"
                        onClick={() => {
                          setEditingQuestion(question._id);
                          setUpdatedAnswer(question.aiResponse.analysis);
                        }}
                      >
                        Edit Answer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div>No Questions for you</div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
