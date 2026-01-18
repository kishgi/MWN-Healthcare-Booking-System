"use client";

import { useEffect, useState } from "react";
import DoctorSidebar from "../../../components/DoctorSidebar";
import {
  Calendar,
  Users,
  Clock,
  Star,
  Bell,
  MessageSquare,
  Search,
  User,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
} from "lucide-react";

import {
  getDoctorAppointments,
  updateAppointmentStatus,
  getDoctorDetails,
  type Appointment,
} from "@/app/api/services/doctor";

interface QuickStat {
  id: string;
  title: string;
  value: string | number;
  icon: any;
  color: string;
  bgColor: string;
}

export default function DoctorDashboard() {
  const doctorId = "DR-001";
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctor, setDoctor] = useState<{
    name: string;
    specialization: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // ----------------- Time -----------------
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // ----------------- Fetch Data -----------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch doctor details
        const doctorData = await getDoctorDetails(doctorId);
        setDoctor({
          name: doctorData?.name || "Dr. Unknown",
          specialization: doctorData?.specialization || "General Physician",
        });

        // Fetch appointments
        const appts = await getDoctorAppointments(doctorId);
        setAppointments(appts || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        // Set fallback data
        setDoctor({
          name: "Dr. Unknown",
          specialization: "General Physician",
        });
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ----------------- Helpers -----------------
  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      confirmed: { color: "bg-green-100 text-green-800", label: "Confirmed" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      completed: { color: "bg-blue-100 text-blue-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      "no-show": { color: "bg-gray-100 text-gray-800", label: "No Show" },
    };

    const statusConfig = config[status] || config.pending;

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}
      >
        {statusConfig.label}
      </span>
    );
  };

  const handleStartConsultation = async (appointment: Appointment) => {
    try {
      await updateAppointmentStatus(appointment.id, "completed");
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointment.id ? { ...a, status: "completed" } : a,
        ),
      );
      alert(`Consultation started for ${appointment.patientName}`);
    } catch (err) {
      console.error("Error updating appointment status:", err);
      alert("Failed to start consultation");
    }
  };

  // Calculate dashboard stats FROM FIRESTORE DATA
  const today = new Date().toISOString().split("T")[0];
  const todaysAppointments = appointments.filter((a) => a.date === today);

  // Calculate real stats from appointments
  const totalAppointments = appointments.length;
  const confirmedCount = appointments.filter(
    (a) => a.status === "confirmed",
  ).length;
  const pendingCount = appointments.filter(
    (a) => a.status === "pending",
  ).length;
  const completedCount = appointments.filter(
    (a) => a.status === "completed",
  ).length;
  const waitingPatients = confirmedCount + pendingCount;

  // Calculate new patients (type === "new")
  const newPatientsCount = appointments.filter((a) => a.type === "new").length;

  // Calculate average visits
  const totalVisits = appointments.reduce(
    (sum, a) => sum + (a.previousVisits || 0),
    0,
  );
  const avgVisits =
    appointments.length > 0
      ? (totalVisits / appointments.length).toFixed(1)
      : "0";

  // Quick stats from Firestore data
  const quickStats: QuickStat[] = [
    {
      id: "stat-1",
      title: "Total Appointments",
      value: totalAppointments,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: "stat-2",
      title: "Patients Waiting",
      value: waitingPatients,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: "stat-3",
      title: "New Patients",
      value: newPatientsCount,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      id: "stat-4",
      title: "Avg. Visits",
      value: avgVisits,
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ----------------- Render -----------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <DoctorSidebar doctorName="Loading..." doctorSpecialization="" />
        <main className="lg:ml-64 flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A8F7A] mb-4"></div>
            <p className="text-gray-700">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorSidebar
        doctorName={doctor?.name || "Dr. Unknown"}
        doctorSpecialization={doctor?.specialization || "General Physician"}
      />

      <main className="lg:ml-64 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Dashboard Overview
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-gray-600">
                  <p className="text-sm md:text-base">{getCurrentDate()}</p>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm md:text-base">{currentTime}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                  onClick={() => alert("View notifications")}
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => alert("View messages")}
                >
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-[#0A8F7A] to-[#098d78] rounded-xl p-6 text-white mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-2">
                    Welcome back, {doctor?.name?.split(" ")[0] || "Doctor"}! 👋
                  </h2>
                  <p className="opacity-90">
                    {waitingPatients > 0
                      ? `You have ${waitingPatients} patients waiting today.`
                      : "No patients waiting today."}
                    {todaysAppointments.length > 0 &&
                      ` ${todaysAppointments.length} appointments scheduled.`}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <button className="px-4 py-2 bg-white text-[#0A8F7A] font-medium rounded-lg hover:bg-gray-100 transition-colors">
                    View Schedule
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {quickStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.id}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Status Overview */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">
                      Today's Appointments
                    </h2>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search patients..."
                        className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-48 focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Status Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-700">
                        {confirmedCount}
                      </p>
                      <p className="text-sm text-blue-600">Confirmed</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-700">
                        {pendingCount}
                      </p>
                      <p className="text-sm text-yellow-600">Pending</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-700">
                        {completedCount}
                      </p>
                      <p className="text-sm text-green-700">Completed</p>
                    </div>
                  </div>

                  {/* Appointments List */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {appointments
                      .filter(
                        (a) =>
                          a.patientName
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          a.token
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      )
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-gray-900">
                                    {appointment.patientName ||
                                      "Unknown Patient"}
                                  </h3>
                                  {appointment.type === "new" && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                      New
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <p className="text-sm text-gray-600">
                                    Token: {appointment.token || "N/A"}
                                  </p>
                                  <span className="text-gray-400">•</span>
                                  <p className="text-sm text-gray-600">
                                    {appointment.patientAge || "N/A"}y •{" "}
                                    {appointment.patientGender || "N/A"}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-700 mt-2">
                                  {appointment.reason || "No reason provided"}
                                </p>
                                <div className="mt-2">
                                  {getStatusBadge(
                                    appointment.status || "pending",
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:items-end gap-2">
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  {appointment.time || "N/A"}
                                </p>
                                {appointment.date && (
                                  <p className="text-sm text-gray-600">
                                    {formatDate(appointment.date)}
                                  </p>
                                )}
                              </div>
                              {appointment.status === "confirmed" && (
                                <button
                                  onClick={() =>
                                    handleStartConsultation(appointment)
                                  }
                                  className="px-4 py-2 bg-[#0A8F7A] text-white text-sm rounded-lg hover:bg-[#098d78] transition-colors whitespace-nowrap"
                                >
                                  Start Consultation
                                </button>
                              )}
                              {appointment.status === "completed" && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                    {appointments.length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-medium text-gray-900 mb-1">
                          No appointments found
                        </h3>
                        <p className="text-gray-600 text-sm">
                          You don't have any appointments scheduled.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Upcoming Appointments */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-[#0A8F7A]" />
                    Today's Schedule
                  </h3>
                  <div className="space-y-3">
                    {todaysAppointments.slice(0, 5).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.patientName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.time}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(appointment.status || "pending")}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 truncate">
                          {appointment.reason}
                        </p>
                      </div>
                    ))}
                    {todaysAppointments.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No appointments today
                      </p>
                    )}
                  </div>
                </div>

                {/* Appointment Types */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Appointment Types
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        New Patients
                      </span>
                      <span className="font-medium">{newPatientsCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Follow-ups</span>
                      <span className="font-medium">
                        {
                          appointments.filter((a) => a.type === "follow-up")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Reviews</span>
                      <span className="font-medium">
                        {appointments.filter((a) => a.type === "review").length}
                      </span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Total
                        </span>
                        <span className="font-bold text-gray-900">
                          {totalAppointments}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-[#0A8F7A]" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
                      onClick={() => alert("Schedule new appointment")}
                    >
                      <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-blue-700">
                        New Appointment
                      </span>
                    </button>
                    <button
                      className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
                      onClick={() => alert("View patient records")}
                    >
                      <FileText className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-green-700">
                        Patient Records
                      </span>
                    </button>
                    <button
                      className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
                      onClick={() => alert("Write prescription")}
                    >
                      <FileText className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-purple-700">
                        Prescription
                      </span>
                    </button>
                    <button
                      className="p-3 bg-amber-50 hover:bg-amber-100 rounded-lg text-center transition-colors"
                      onClick={() => alert("View calendar")}
                    >
                      <Calendar className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-amber-700">
                        Calendar
                      </span>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {completedCount > 0 && (
                      <div className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-gray-700">
                          {completedCount} consultations completed
                        </span>
                      </div>
                    )}
                    {waitingPatients > 0 && (
                      <div className="flex items-center text-sm">
                        <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
                        <span className="text-gray-700">
                          {waitingPatients} patients waiting
                        </span>
                      </div>
                    )}
                    {newPatientsCount > 0 && (
                      <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-700">
                          {newPatientsCount} new patients
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
