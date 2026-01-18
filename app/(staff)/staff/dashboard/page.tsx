"use client";

import { useState, useEffect } from "react";
import StaffSidebar from "../../../components/StaffSidebar";
import { db } from "@/app/firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  getCountFromServer,
  orderBy,
} from "firebase/firestore";
import {
  Calendar,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Filter,
  Download,
  ChevronRight,
  Bell,
  User,
  Activity,
  PieChart,
  FileText,
  MessageSquare,
  Loader2,
  PlusCircle,
  AlertTriangle,
  Receipt,
  UserPlus,
  Eye,
} from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  doctorId: string;
  doctorName: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  reason?: string;
  token?: string;
  priority?: string;
}

interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  contact?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface BillingRecord {
  id: string;
  patientName: string;
  total: number;
  status: "pending" | "paid" | "partial";
  createdAt: any;
}

const StaffDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);

  // Data states
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>(
    [],
  );
  const [waitingTokens, setWaitingTokens] = useState<Appointment[]>([]);
  const [quickStats, setQuickStats] = useState({
    totalPatients: 0,
    patientsToday: 0,
    pendingBills: 0,
    totalRevenue: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    confirmedAppointments: 0,
    waitingPatients: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Fetch all data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const today = getTodayDate();

        // 1️⃣ Fetch today's appointments
        const appointmentsRef = collection(db, "appointments");
        const appointmentsQuery = query(
          appointmentsRef,
          where("date", "==", today),
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);

        const appointmentsData: Appointment[] = [];
        for (const doc of appointmentsSnapshot.docs) {
          const data = doc.data();

          // Get doctor name if not in appointment data
          let doctorName = data.doctorName || "Unknown Doctor";
          if (!data.doctorName && data.doctorId) {
            try {
              const doctorDoc = await getDocs(collection(db, "users"));
              const doctorData = doctorDoc.docs.find(
                (d) => d.id === data.doctorId && d.data().role === "doctor",
              );
              if (doctorData) {
                doctorName = doctorData.data().name;
              }
            } catch (error) {
              console.error("Error fetching doctor name:", error);
            }
          }

          appointmentsData.push({
            id: doc.id,
            patientName: data.patientName || "Unknown Patient",
            patientId: data.patientId || "",
            date: data.date || today,
            time: data.time || "",
            type: data.type || "consultation",
            doctorId: data.doctorId || "",
            doctorName: doctorName,
            status: data.status || "pending",
            reason: data.reason || "",
            token: data.token || "",
            priority: data.priority || "normal",
          });
        }

        setTodaysAppointments(appointmentsData);

        // 2️⃣ Set waiting tokens (appointments with status 'confirmed' or 'pending')
        const waitingData = appointmentsData.filter(
          (appt) => appt.status === "confirmed" || appt.status === "pending",
        );
        setWaitingTokens(waitingData);

        // 3️⃣ Fetch total patients count
        const patientsRef = collection(db, "patients");
        const patientsSnapshot = await getCountFromServer(patientsRef);
        const totalPatients = patientsSnapshot.data().count;

        // 4️⃣ Fetch billing records
        const billingRef = collection(db, "billing");
        const billingSnapshot = await getDocs(billingRef);

        let pendingBills = 0;
        let totalRevenue = 0;
        const billingRecords: BillingRecord[] = [];

        billingSnapshot.forEach((doc) => {
          const data = doc.data();
          const bill: BillingRecord = {
            id: doc.id,
            patientName: data.patientName || "Unknown",
            total: data.total || 0,
            status: data.status || "pending",
            createdAt: data.createdAt,
          };

          billingRecords.push(bill);

          if (data.status === "pending" || data.status === "partial") {
            pendingBills++;
          }

          if (data.status === "paid" && data.total) {
            totalRevenue += data.total;
          }
        });

        // 5️⃣ Calculate appointment stats
        const completedAppointments = appointmentsData.filter(
          (a) => a.status === "completed",
        ).length;
        const cancelledAppointments = appointmentsData.filter(
          (a) => a.status === "cancelled",
        ).length;
        const confirmedAppointments = appointmentsData.filter(
          (a) => a.status === "confirmed",
        ).length;
        const waitingPatients = waitingData.length;

        // 6️⃣ Set quick stats
        setQuickStats({
          totalPatients,
          patientsToday: appointmentsData.length,
          pendingBills,
          totalRevenue,
          completedAppointments,
          cancelledAppointments,
          confirmedAppointments,
          waitingPatients,
        });

        // 7️⃣ Generate recent activity
        const activities = [];
        const now = new Date();

        if (appointmentsData.length > 0) {
          activities.push({
            type: "appointment",
            message: `${appointmentsData.length} appointments scheduled today`,
            time: "Today",
            icon: CheckCircle,
            color: "green",
          });
        }

        if (pendingBills > 0) {
          activities.push({
            type: "billing",
            message: `${pendingBills} pending bills need attention`,
            time: "Today",
            icon: AlertTriangle,
            color: "amber",
          });
        }

        if (completedAppointments > 0) {
          activities.push({
            type: "completed",
            message: `${completedAppointments} appointments completed today`,
            time: "Today",
            icon: CheckCircle,
            color: "blue",
          });
        }

        // Add some recent appointments as activities
        const recentAppointments = appointmentsData.slice(0, 3);
        recentAppointments.forEach((appt) => {
          activities.push({
            type: "appointment",
            message: `Appointment for ${appt.patientName} at ${appt.time}`,
            time: "Today",
            icon: Calendar,
            color: "purple",
          });
        });

        setRecentActivity(activities);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === "urgent"
      ? "bg-red-100 text-red-800 border border-red-200"
      : "bg-blue-100 text-blue-800 border border-blue-200";
  };

  const getPriorityIcon = (priority: string) => {
    return priority === "urgent" ? (
      <AlertCircle className="w-3 h-3 mr-1" />
    ) : null;
  };

  const getWaitingTime = (time: string) => {
    // Simple waiting time calculation (for demo)
    const appointmentTime = new Date(`2000-01-01T${time}`);
    const now = new Date();
    const currentTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
    );

    if (appointmentTime > currentTime) {
      const diff = appointmentTime.getTime() - currentTime.getTime();
      const minutes = Math.floor(diff / 60000);
      return minutes > 0 ? `${minutes} mins` : "Now";
    }
    return "Overdue";
  };

  const filteredAppointments = todaysAppointments.filter((appointment) => {
    if (filterType === "all") return true;
    return appointment.status === filterType;
  });

  const formatTime = (time: string) => {
    // Convert 24h to 12h format if needed
    if (time.includes(":")) {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    return time;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-black">
        <StaffSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main
          className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"} flex items-center justify-center min-h-screen`}
        >
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-[#0A8F7A] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Loading Dashboard
            </h1>
            <p className="text-gray-600">
              Fetching real-time data from the system...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-black">
      <StaffSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <main
        className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}
      >
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Staff Dashboard
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Welcome back! Here's what's happening today.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients, appointments..."
                  className="pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] w-64 text-gray-800 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button className="relative p-3 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  JD
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Patients Today */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Patients Today
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-4xl font-bold text-gray-900">
                        {quickStats.patientsToday}
                      </p>
                      <span className="ml-3 text-sm text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                      Out of {quickStats.totalPatients} total patients
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Pending Bills */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Pending Bills
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-4xl font-bold text-gray-900">
                        {quickStats.pendingBills}
                      </p>
                      {quickStats.pendingBills > 0 && (
                        <span className="ml-3 text-sm text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-full">
                          Needs attention
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                      Total outstanding
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl flex items-center justify-center shadow-sm">
                    <DollarSign className="w-7 h-7 text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Total Revenue
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-4xl font-bold text-gray-900">
                        {formatCurrency(quickStats.totalRevenue)}
                      </p>
                      <span className="ml-3 text-sm text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                        +8.5%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">This month</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                    <TrendingUp className="w-7 h-7 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Appointments Status */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Today's Appointments
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Confirmed</span>
                        <span className="font-bold text-lg text-green-700">
                          {quickStats.confirmedAppointments}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Waiting</span>
                        <span className="font-bold text-lg text-blue-700">
                          {quickStats.waitingPatients}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="font-bold text-lg text-purple-700">
                          {quickStats.completedAppointments}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Calendar className="w-7 h-7 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Today's Appointments Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Calendar className="w-6 h-6 mr-3 text-[#0A8F7A]" />
                        Today's Appointments
                      </h2>
                      <p className="text-gray-600 mt-2 font-medium">
                        {todaysAppointments.length} appointments scheduled for
                        today
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <select
                        className="px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] bg-white"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No appointments today
                            </h3>
                            <p className="text-gray-600">
                              {filterType === "all"
                                ? "No appointments scheduled for today"
                                : `No ${filterType} appointments found`}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map((appointment) => (
                          <tr
                            key={appointment.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-8 py-4">
                              <div>
                                <div className="font-bold text-gray-900 text-base">
                                  {appointment.patientName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {appointment.patientId}
                                </div>
                                {appointment.reason && (
                                  <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                    {appointment.reason}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-4 whitespace-nowrap">
                              <div className="font-bold text-gray-900">
                                {formatTime(appointment.time)}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {appointment.type}
                              </div>
                            </td>
                            <td className="px-8 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {appointment.doctorName}
                              </div>
                            </td>
                            <td className="px-8 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(appointment.status)}`}
                              >
                                {getStatusIcon(appointment.status)}
                                <span className="ml-2">
                                  {appointment.status.charAt(0).toUpperCase() +
                                    appointment.status.slice(1)}
                                </span>
                              </span>
                            </td>
                            <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-3">
                                <button className="text-blue-600 hover:text-blue-800 font-semibold flex items-center">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </button>
                                <button className="text-gray-600 hover:text-gray-800 font-semibold">
                                  Check-in
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <button className="text-blue-600 hover:text-blue-800 font-semibold text-base flex items-center">
                      View All Appointments
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                    <div className="flex items-center space-x-3">
                      <button className="px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </button>
                      <button
                        onClick={() =>
                          (window.location.href = "/staff/appointments")
                        }
                        className="px-4 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Appointment
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Waiting List / Tokens Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Clock className="w-6 h-6 mr-3 text-[#0A8F7A]" />
                        Waiting List
                      </h2>
                      <p className="text-gray-600 mt-2 font-medium">
                        {waitingTokens.length} patients currently waiting
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                        <Filter className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {waitingTokens.length === 0 ? (
                    <div className="px-8 py-16 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No patients waiting
                      </h3>
                      <p className="text-gray-600">
                        All appointments are either completed or scheduled for
                        later
                      </p>
                    </div>
                  ) : (
                    waitingTokens.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="px-8 py-5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-14 h-14 bg-gradient-to-r from-blue-50 to-cyan-100 rounded-xl flex items-center justify-center mr-5 shadow-sm">
                              <span className="text-2xl font-bold text-blue-600">
                                {appointment.token ||
                                  "T-" + appointment.id.slice(0, 4)}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-lg">
                                {appointment.patientName}
                              </div>
                              <div className="flex items-center mt-2 space-x-4">
                                <span className="text-sm text-gray-600 flex items-center font-medium">
                                  <Clock className="w-4 h-4 mr-2" />
                                  Waiting: {getWaitingTime(appointment.time)}
                                </span>
                                <span className="text-sm text-gray-600 font-medium">
                                  Doctor: {appointment.doctorName.split(" ")[0]}
                                </span>
                              </div>
                              {appointment.reason && (
                                <p className="text-sm text-gray-500 mt-2 max-w-md truncate">
                                  {appointment.reason}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getPriorityColor(appointment.priority || "normal")}`}
                            >
                              {getPriorityIcon(
                                appointment.priority || "normal",
                              )}
                              <span className="ml-1">
                                {(appointment.priority || "normal")
                                  .charAt(0)
                                  .toUpperCase() +
                                  (appointment.priority || "normal").slice(1)}
                              </span>
                            </span>
                            <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="w-5 h-5 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button className="text-blue-600 hover:text-blue-800 font-semibold text-base flex items-center">
                      Manage Waiting List
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                    <div className="flex items-center space-x-3">
                      <button className="px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </button>
                      <button className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Patient
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-[#0A8F7A]" />
                  Quick Actions
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={() =>
                      (window.location.href = "/staff/appointments")
                    }
                    className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="font-semibold text-gray-800">
                        Create New Appointment
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center">
                      <Receipt className="w-5 h-5 mr-3 text-green-600" />
                      <span className="font-semibold text-gray-800">
                        Generate Invoice
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-3 text-amber-600" />
                      <span className="font-semibold text-gray-800">
                        Patient Check-in
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 mr-3 text-purple-600" />
                      <span className="font-semibold text-gray-800">
                        View Reports
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-[#0A8F7A]" />
                  Recent Activity
                </h3>
                <div className="space-y-5">
                  {recentActivity.slice(0, 3).map((activity, index) => {
                    const Icon = activity.icon;
                    const colorClass = `bg-${activity.color}-50 text-${activity.color}-600`;

                    return (
                      <div key={index} className="flex items-start">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${colorClass}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {recentActivity.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">
                        No recent activity to show
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Today's Summary */}
              <div className="bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] rounded-2xl p-6 text-white">
                <h3 className="font-bold text-2xl mb-6">Today's Summary</h3>
                <div className="space-y-5">
                  <div className="flex justify-between items-center pb-4 border-b border-white/20">
                    <span className="font-medium">Appointments</span>
                    <span className="font-bold text-xl">
                      {todaysAppointments.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/20">
                    <span className="font-medium">Patients Waiting</span>
                    <span className="font-bold text-xl">
                      {waitingTokens.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/20">
                    <span className="font-medium">Pending Bills</span>
                    <span className="font-bold text-xl">
                      {quickStats.pendingBills}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Revenue Today</span>
                    <span className="font-bold text-xl">
                      {formatCurrency(quickStats.totalRevenue)}
                    </span>
                  </div>
                </div>
                <button className="w-full mt-8 py-3.5 bg-white text-[#0A8F7A] font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                  View Full Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
