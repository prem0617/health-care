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
}

interface ChatHistory {
  userId: {
    _id: string;
    name: string;
  };
  questions: {
    question: string;
    aiResponse: {
      analysis: string;
      timestamp: string;
    };
    isChecked: boolean;
    createdAt: string;
    _id: string;
  }[];
  _id: string;
}

const DoctorDashboard = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [doctorName, setDoctorName] = useState<string>("");
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [updatedAnswer, setUpdatedAnswer] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("doctorToken");
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      setDoctorName(decodedToken.name || "Doctor");
      fetchChatHistory();
    }
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/verifyChat/chat-history"
      );
      setChatHistory(response.data.data || []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleVerifyChat = async ({ chatId, questionId }: any) => {
    try {
      const token = localStorage.getItem("doctorToken");
      const response = await axios.put(
        `http://localhost:8000/api/verifyChat/verify-chat/${chatId}/${questionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Chat verified:", response.data);

      // Update the UI locally
      setChatHistory((prevChatHistory) =>
        prevChatHistory.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                questions: chat.questions.map((question) =>
                  question._id === questionId
                    ? { ...question, isChecked: true }
                    : question
                ),
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Error verifying chat:", error);
    }
  };

  const handleUpdateAnswer = async (chatId: string, questionId: string) => {
    if (!updatedAnswer) {
      alert("Please provide an updated answer.");
      return;
    }

    try {
      const token = localStorage.getItem("doctorToken");
      const response = await axios.put(
        `http://localhost:8000/api/verifyChat/update-answer/${chatId}/${questionId}`,
        { answer: updatedAnswer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Answer updated:", response.data);

      // Update the UI locally
      setChatHistory((prevChatHistory) =>
        prevChatHistory.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                questions: chat.questions.map((question) =>
                  question._id === questionId
                    ? {
                        ...question,
                        aiResponse: {
                          ...question.aiResponse,
                          analysis: updatedAnswer,
                        },
                      }
                    : question
                ),
              }
            : chat
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

  return (
    <DoctorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome, Dr. {doctorName}
        </h1>

        <div className="mt-6 space-y-6">
          <h2 className="text-xl font-medium text-gray-800">Chat History</h2>

          {chatHistory.map((chat) => (
            <Card key={chat._id} className="shadow-md bg-white p-4">
              <CardHeader>
                <CardTitle className="font-semibold text-lg text-gray-700 flex justify-between">
                  Chat with {chat.userId.name}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {formatDate(chat.questions[0].createdAt)}
                </p>
              </CardHeader>
              <CardContent>
                {chat.questions.map((question) => (
                  <div key={question._id} className="mt-4">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium text-gray-800">
                        Q: {question.question}
                      </div>

                      {/* Conditionally render the button only if the question is not checked */}
                      {!question.isChecked && (
                        <Button
                          className="bg-blue-700 hover:bg-blue-800"
                          onClick={() =>
                            handleVerifyChat({
                              chatId: chat._id,
                              questionId: question._id,
                            })
                          }
                        >
                          Verify Chat
                        </Button>
                      )}
                    </div>
                    <div className="mt-2 text-gray-600">
                      <p>
                        A:{" "}
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

                    {/* Show the update button only if editing */}
                    {editingQuestion === question._id ? (
                      <div className="mt-2">
                        <Button
                          className="bg-green-700 hover:bg-green-800"
                          onClick={() =>
                            handleUpdateAnswer(chat._id, question._id)
                          }
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
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
