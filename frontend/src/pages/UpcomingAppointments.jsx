"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, Clock, Video, Pill, User, Stethoscope, Calendar, CheckCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion, AnimatePresence } from "framer-motion"
import { BACKEND_URL } from "@/config"
import PrescriptionDisplay from "@/components/custom/PrescriptionDisplay"

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return "Today"
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow"
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    })
  }
}

const AppointmentSkeleton = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-28" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-18 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const UpcomingAppointments = () => {
  const [transactions, setTransactions] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchUserAppointment = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/transactions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setTransactions(data.transactions)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/prescription/getMedicine`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setPrescriptions(data)
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
    }
  }

  useEffect(() => {
    if (isClient) {
      const fetchData = async () => {
        setLoading(true)
        await Promise.all([fetchUserAppointment(), fetchPrescriptions()])
        setTimeout(() => setLoading(false), 800)
      }
      fetchData()
    }
  }, [isClient])

  const getPrescriptionByAppointmentId = (appointmentId) => {
    return prescriptions.find((p) => p.appointmentId === appointmentId)
  }

  const now = new Date()
  const upcomingAppointments = transactions
    .filter((transaction) => {
      const appointmentDate = new Date(transaction.appointmentId.date)
      return appointmentDate >= now
    })
    .sort((a, b) => new Date(a.appointmentId.date) - new Date(b.appointmentId.date))

  const previousAppointments = transactions
    .filter((transaction) => {
      const appointmentDate = new Date(transaction.appointmentId.date)
      return appointmentDate < now
    })
    .sort((a, b) => new Date(b.appointmentId.date) - new Date(a.appointmentId.date))

  const getAppointmentStatus = (transaction, isUpcoming) => {
    const appointmentDate = new Date(transaction.appointmentId.date)
    const now = new Date()
    const isToday = appointmentDate.toDateString() === now.toDateString()

    if (isUpcoming) {
      if (isToday)
        return { label: "Today", color: "bg-orange-500", textColor: "text-orange-700", bgColor: "bg-orange-50" }
      return { label: "Scheduled", color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-50" }
    } else {
      return { label: "Completed", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50" }
    }
  }

  const AppointmentCard = ({ transaction, isUpcoming, index }) => {
    const prescription = getPrescriptionByAppointmentId(transaction.appointmentId._id)
    const hasZoomLink = transaction.appointmentId.zoomLink
    const status = getAppointmentStatus(transaction, isUpcoming)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        whileHover={{ y: -2 }}
        className="group"
      >
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <User className="w-7 h-7 text-blue-600" />
                  </div>
                  <div
                    className={`absolute -top-1 -right-1 w-4 h-4 ${status.color} rounded-full flex items-center justify-center`}
                  >
                    {isUpcoming ? (
                      <Clock className="w-2.5 h-2.5 text-white" />
                    ) : (
                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      Dr. {transaction.appointmentId.doctorId.name}
                    </h3>
                    <Badge className={`${status.bgColor} ${status.textColor} border-0 font-medium px-2 py-1 text-xs`}>
                      {status.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Stethoscope className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{transaction.appointmentId.doctorId.specialization}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{formatDate(transaction.appointmentId.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">
                        {transaction.appointmentId.slot.startTime} - {transaction.appointmentId.slot.endTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {hasZoomLink && isUpcoming && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-400  text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Video className="w-4 h-4" />
                        Join
                      </motion.button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4 bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-blue-500" />
                          <h4 className="font-bold text-gray-900">Video Consultation</h4>
                        </div>
                        <p className="text-sm text-gray-600 break-all bg-gray-50 p-3 rounded-lg">
                          {transaction.appointmentId.zoomLink}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => window.open(transaction.appointmentId.zoomLink, "_blank")}
                          className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-400 hover:from-blue-600 hover:via-purple-600 hover:to-pink-500 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg"
                        >
                          Open Meeting Room
                        </motion.button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {prescription && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Pill className="w-4 h-4" />
                        Prescription
                      </motion.button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
                      <PrescriptionDisplay prescription={prescription} />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const currentAppointments = activeTab === "upcoming" ? upcomingAppointments : previousAppointments

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r text-blue-600   bg-clip-text ">
                My Appointments
              </h1>
              <p className="text-gray-600 mt-1">Manage your healthcare consultations</p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8 overflow-hidden"
        >
          <div className="flex">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 px-6 py-5 text-center font-semibold rounded-l-2xl transition-all duration-300 ${
                activeTab === "upcoming"
                  ? "bg-gradient-to-r from-blue-800 via-blue-900 to-blue-900 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <CalendarDays className="w-5 h-5" />
                <span>Upcoming</span>
                {upcomingAppointments.length > 0 && (
                  <Badge
                    className={`${activeTab === "upcoming" ? "bg-white/20 text-white" : "bg-blue-500 text-white"} ml-2 font-bold`}
                  >
                    {upcomingAppointments.length}
                  </Badge>
                )}
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("previous")}
              className={`flex-1 px-6 py-5 text-center font-semibold rounded-r-2xl transition-all duration-300 ${
                activeTab === "previous"
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <span>Previous</span>
                {previousAppointments.length > 0 && (
                  <Badge
                    className={`${activeTab === "previous" ? "bg-white/20 text-white" : "bg-gray-500 text-white"} ml-2 font-bold`}
                  >
                    {previousAppointments.length}
                  </Badge>
                )}
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Appointments List */}
        <div className="space-y-5">
          {loading ? (
            <div className="space-y-5">
              {[...Array(3)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AppointmentSkeleton />
                </motion.div>
              ))}
            </div>
          ) : currentAppointments.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {currentAppointments.map((transaction, index) => (
                  <AppointmentCard
                    key={transaction._id}
                    transaction={transaction}
                    isUpcoming={activeTab === "upcoming"}
                    index={index}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CalendarDays className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No {activeTab} appointments</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {activeTab === "upcoming"
                  ? "You don't have any upcoming appointments scheduled. Book a consultation to get started!"
                  : "No previous appointments found. Your consultation history will appear here."}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UpcomingAppointments
