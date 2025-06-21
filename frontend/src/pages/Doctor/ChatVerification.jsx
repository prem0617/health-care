import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DoctorLayout from "./DoctorLayout";
import { BACKEND_URL } from "@/config";

const ChatVerification = () => {
  const [chatData, setChatData] = useState([]);
  const [doctorData, setDoctorData] = useState({
    email: "",
    doctorId: "",
    name: "",
    specialization: "",
  });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [updatedAnswer, setUpdatedAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      if (!doctorData.specialization) return;

      const response = await axios.post(
        `${BACKEND_URL}/api/verifyChat/chat-history`,
        { specialization: doctorData.specialization }
      );
      console.log(response);
      if (response.data?.data) {
        setChatData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("doctorToken");
    if (token) {
      const decoded = jwtDecode(token);
      setDoctorData(decoded);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [doctorData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleVerifyChat = async (questionId, chatId) => {
    try {
      const token = localStorage.getItem("doctorToken");
      await axios.put(
        `${BACKEND_URL}/api/verifyChat/verify-chat/${questionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the specific question in the nested structure
      setChatData((prev) =>
        prev.map((chat) =>
          chat.chatId === chatId
            ? {
                ...chat,
                questions: chat.questions.map((q) =>
                  q._id === questionId ? { ...q, isChecked: true } : q
                ),
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Error verifying question:", error);
    }
  };

  const handleUpdateAnswer = async (questionId, chatId) => {
    if (!updatedAnswer) {
      alert("Please provide an updated answer.");
      return;
    }

    try {
      const token = localStorage.getItem("doctorToken");
      await axios.put(
        `${BACKEND_URL}/api/verifyChat/update-answer/${questionId}`,
        { answer: updatedAnswer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the specific question in the nested structure
      setChatData((prev) =>
        prev.map((chat) =>
          chat.chatId === chatId
            ? {
                ...chat,
                questions: chat.questions.map((q) =>
                  q._id === questionId
                    ? {
                        ...q,
                        aiResponse: {
                          ...q.aiResponse,
                          analysis: updatedAnswer,
                        },
                      }
                    : q
                ),
              }
            : chat
        )
      );

      setEditingQuestion(null);
      setUpdatedAnswer("");
    } catch (error) {
      console.error("Error updating answer:", error);
      alert("Error updating the answer. Please try again.");
    }
  };

  // Get all questions from all chats for display
  const getAllQuestions = () => {
    return chatData.flatMap((chat) =>
      chat.questions.map((question) => ({
        ...question,
        chatId: chat.chatId,
        userEmail: chat.userId.email,
        userName: chat.userId.profile?.name || chat.userId.email,
      }))
    );
  };

  const allQuestions = getAllQuestions();

  return (
    <DoctorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

        <div className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-800">Questions</h2>
            <div className="text-sm text-gray-600">
              Total Questions: {allQuestions.length} | Chats: {chatData.length}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : allQuestions.length > 0 ? (
            allQuestions.map((question) => (
              <Card
                key={`${question.chatId}-${question._id}`}
                className="shadow-md bg-white p-4"
              >
                <CardHeader>
                  <CardTitle className="font-semibold text-lg text-gray-700 flex justify-between">
                    Question Details
                    <span className="text-sm font-normal text-gray-500">
                      User: {question.userName}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {formatDate(question.createdAt)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mt-4">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium text-gray-800 flex-1 mr-4">
                        <span className="font-semibold">Q:</span>{" "}
                        {question.question}
                      </div>

                      {!question.isChecked && (
                        <Button
                          className="bg-blue-700 hover:bg-blue-800 shrink-0"
                          onClick={() =>
                            handleVerifyChat(question._id, question.chatId)
                          }
                        >
                          Verify Question
                        </Button>
                      )}
                    </div>
                    <div className="mt-2 text-gray-600">
                      <div className="flex items-start">
                        <span className="font-semibold mr-2">A:</span>
                        <div className="flex-1">
                          {editingQuestion === question._id ? (
                            <textarea
                              value={updatedAnswer}
                              onChange={(e) => setUpdatedAnswer(e.target.value)}
                              className="border p-2 w-full rounded-md resize-vertical min-h-[100px]"
                              rows={4}
                            />
                          ) : (
                            <p className="whitespace-pre-wrap">
                              {question.aiResponse.analysis}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`text-sm px-2 py-1 rounded-full ${
                            question.isChecked
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {question.isChecked ? "✓ Verified" : "⏳ Pending"}
                        </div>
                        <div className="text-xs text-gray-400">
                          <span>{formatDate(question.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {editingQuestion === question._id ? (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingQuestion(null);
                                setUpdatedAnswer("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="bg-green-700 hover:bg-green-800"
                              onClick={() =>
                                handleUpdateAnswer(
                                  question._id,
                                  question.chatId
                                )
                              }
                            >
                              Save Answer
                            </Button>
                          </>
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">
                No questions found for your specialization
              </p>
              <p className="text-sm mt-2">
                Questions will appear here when patients ask about{" "}
                {doctorData.specialization}
              </p>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default ChatVerification;
