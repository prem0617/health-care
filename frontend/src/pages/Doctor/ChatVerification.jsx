"use client"

import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import DoctorLayout from "./DoctorLayout"
import { BACKEND_URL } from "@/config"

const ChatVerification = () => {
  const [chatData, setChatData] = useState([])
  const [doctorData, setDoctorData] = useState({
    email: "",
    doctorId: "",
    name: "",
    specialization: "",
  })
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [updatedAnswer, setUpdatedAnswer] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      if (!doctorData.specialization) return

      const response = await axios.post(`${BACKEND_URL}/api/verifyChat/chat-history`, {
        specialization: doctorData.specialization,
      })
      console.log(response)
      if (response.data?.data) {
        setChatData(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("doctorToken")
    if (token) {
      const decoded = jwtDecode(token)
      setDoctorData(decoded)
    }
  }, [])

  useEffect(() => {
    fetchQuestions()
  }, [doctorData])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleVerifyChat = async (questionId, chatId) => {
    try {
      const token = localStorage.getItem("doctorToken")
      await axios.put(
        `${BACKEND_URL}/api/verifyChat/verify-chat/${questionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Update the specific question in the nested structure
      setChatData((prev) =>
        prev.map((chat) =>
          chat.chatId === chatId
            ? {
                ...chat,
                questions: chat.questions.map((q) => (q._id === questionId ? { ...q, isChecked: true } : q)),
              }
            : chat,
        ),
      )
    } catch (error) {
      console.error("Error verifying question:", error)
    }
  }

  const handleUpdateAnswer = async (questionId, chatId) => {
    if (!updatedAnswer) {
      alert("Please provide an updated answer.")
      return
    }

    try {
      const token = localStorage.getItem("doctorToken")
      await axios.put(
        `${BACKEND_URL}/api/verifyChat/update-answer/${questionId}`,
        { answer: updatedAnswer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

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
                    : q,
                ),
              }
            : chat,
        ),
      )

      setEditingQuestion(null)
      setUpdatedAnswer("")
    } catch (error) {
      console.error("Error updating answer:", error)
      alert("Error updating the answer. Please try again.")
    }
  }

  // Get all questions from all chats for display - ONLY UNVERIFIED ONES
  const getAllQuestions = () => {
    return chatData.flatMap((chat) =>
      chat.questions
        .filter((question) => !question.isChecked) // Only show unverified questions
        .map((question) => ({
          ...question,
          chatId: chat.chatId,
          userEmail: chat.userId.email,
          userName: chat.userId.profile?.name || chat.userId.email,
        })),
    )
  }

  const allQuestions = getAllQuestions()

  return (
    <DoctorLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Chat Verification Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Review and verify patient questions for {doctorData.specialization}
                </p>
              </div>
            </div>
          </div>

         

          {/* Content Section */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                </div>
                <p className="text-gray-600 font-medium">Loading questions...</p>
              </div>
            ) : allQuestions.length > 0 ? (
              allQuestions.map((question) => (
                <Card
                  key={`${question.chatId}-${question._id}`}
                  className="group hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-1 ${
                      question.isChecked
                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                        : "bg-gradient-to-r from-yellow-500 to-orange-600"
                    }`}
                  ></div>

                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-800 mb-1">Patient Question</CardTitle>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">{question.userName}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{formatDate(question.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          question.isChecked
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                            : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border border-yellow-200"
                        }`}
                      >
                        {question.isChecked ? (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Verified
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Pending Review
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Question Section */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">Q</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium leading-relaxed">{question.question}</p>
                        </div>
                        {!question.isChecked && (
                          <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6 flex-shrink-0"
                            onClick={() => handleVerifyChat(question._id, question.chatId)}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Answer Section */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <div className="flex-1">
                          {editingQuestion === question._id ? (
                            <textarea
                              value={updatedAnswer}
                              onChange={(e) => setUpdatedAnswer(e.target.value)}
                              className="w-full p-4 border-2 border-purple-300 rounded-xl resize-vertical min-h-[120px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                              rows={4}
                              placeholder="Enter your updated answer..."
                            />
                          ) : (
                            <div className="prose prose-sm max-w-none">
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {question.aiResponse.analysis}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">Last updated: {formatDate(question.createdAt)}</div>

                      <div className="flex flex-wrap gap-2">
                        {editingQuestion === question._id ? (
                          <>
                            <Button
                              variant="outline"
                              className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 rounded-lg px-4"
                              onClick={() => {
                                setEditingQuestion(null)
                                setUpdatedAnswer("")
                              }}
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Cancel
                            </Button>
                            <Button
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6"
                              onClick={() => handleUpdateAnswer(question._id, question.chatId)}
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Save Answer
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6"
                            onClick={() => {
                              setEditingQuestion(question._id)
                              setUpdatedAnswer(question.aiResponse.analysis)
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit Answer
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No unverified questions found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  All questions for{" "}
                  <span className="font-medium text-blue-600">{doctorData.specialization}</span> have been verified.
                  New unverified questions will appear here when patients ask new questions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  )
}

export default ChatVerification