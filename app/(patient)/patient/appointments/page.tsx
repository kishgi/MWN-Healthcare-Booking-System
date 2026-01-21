"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Search,
  Filter,
  ChevronRight,
  Download,
  Mail,
  Phone,
  CalendarPlus,
  RefreshCw,
  X,
  CheckCircle,
  Clock as ClockIcon,
  XCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Bell,
  Loader2,
  Plus,
  Save,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import Sidebar from "../../../components/PatientSidebar";
import BookAppointmentModal from "../../../components/BookingModal";
import EditAppointmentModal from "../../../components/EditAppointmentModal";
import { db } from "@/app/firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

// Types
type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled";
type AppointmentType = "new" | "follow-up" | "review";

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  date: string;
  time: string;
  token: string;
  status: AppointmentStatus;
  reason: string;
  priority: string;
  duration: string;
  type: AppointmentType;
  symptoms: string[];
  labReports: string[];
  previousVisits: number;
  insurance: string;
  bookedBy: string;
  bookedAt: string;
  createdAt: string;
  doctorName?: string;
  doctorSpecialization?: string;
  doctorEmail?: string;
  doctorPhone?: string;
  branch?: string;
  // For display
  typeCategory?: "upcoming" | "past";
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  branch?: string;
  email?: string;
  phone?: string;
}

interface Branch {
  id: string;
  name: string;
}

export default function AppointmentsPage() {
  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showBookModal, setShowBookModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    branch: "",
    doctor: "",
    status: "",
  });

  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState({
    appointments: true,
    doctors: false,
    branches: false,
  });

  // Patient ID (using PAT-001 from your seed data)
  const patientId = "PAT-001";
  const patientName = "Robert Chen";

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading((prev) => ({ ...prev, appointments: true }));

      // 1. Fetch appointments for this patient
      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("patientId", "==", patientId),
      );

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];

      // 2. Fetch doctors information
      const doctorIds = [...new Set(appointmentsData.map((a) => a.doctorId))];
      const doctorsMap = new Map();

      const doctorPromises = doctorIds.map(async (doctorId) => {
        try {
          const doctorDoc = await getDoc(doc(db, "users", doctorId));
          if (doctorDoc.exists()) {
            const doctorData = doctorDoc.data() as Doctor;
            doctorsMap.set(doctorId, {
              id: doctorId,
              name: doctorData.name,
              specialization:
                doctorData.specialization || "General Practitioner",
              branch: doctorData.branch,
              email: doctorData.email,
              phone: doctorData.phone,
            });
          }
        } catch (error) {
          console.error(`Error fetching doctor ${doctorId}:`, error);
        }
      });

      await Promise.all(doctorPromises);

      // 3. Enrich appointments with doctor data and categorize
      const today = new Date().toISOString().split("T")[0];
      const enrichedAppointments = appointmentsData.map((appointment) => {
        const doctorInfo = doctorsMap.get(appointment.doctorId);

        // Categorize as upcoming or past based on date
        const isPast =
          appointment.date < today ||
          appointment.status === "completed" ||
          appointment.status === "cancelled";

        return {
          ...appointment,
          doctorName: doctorInfo?.name || "Doctor",
          doctorSpecialization:
            doctorInfo?.specialization || "General Practitioner",
          doctorEmail: doctorInfo?.email,
          doctorPhone: doctorInfo?.phone,
          branch: doctorInfo?.branch || "Colombo",
          typeCategory: isPast ? "past" : "upcoming",
        };
      });

      // 4. Get unique doctors for filter dropdown
      const uniqueDoctors = Array.from(doctorsMap.values());
      setDoctors(uniqueDoctors);

      // 5. Get unique branches for filter dropdown
      const uniqueBranches = [
        ...new Set(uniqueDoctors.map((d) => d.branch).filter(Boolean)),
      ];
      setBranches(
        uniqueBranches.map((branch) => ({
          id: branch || "",
          name: branch || "",
        })),
      );

      setAppointments(enrichedAppointments);

      // Initialize filtered appointments
      setFilteredAppointments(
        enrichedAppointments.filter((app) => app.typeCategory === "upcoming"),
      );
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      showNotificationMessage(
        error.message?.includes("index")
          ? "Loading data... Please wait for indexes to build"
          : "Failed to load appointments",
        "error",
      );
    } finally {
      setLoading((prev) => ({ ...prev, appointments: false }));
    }
  };

  // Apply filters and search
  useEffect(() => {
    if (loading.appointments) return;

    let filtered = appointments.filter(
      (appointment) => appointment.typeCategory === activeTab,
    );

    // Apply filters
    if (filters.branch) {
      filtered = filtered.filter(
        (appointment) => appointment.branch === filters.branch,
      );
    }
    if (filters.doctor) {
      filtered = filtered.filter(
        (appointment) => appointment.doctorName === filters.doctor,
      );
    }
    if (filters.status) {
      filtered = filtered.filter(
        (appointment) => appointment.status === filters.status,
      );
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (appointment) =>
          appointment.doctorName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          appointment.branch
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          appointment.date.includes(searchQuery) ||
          appointment.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.reason?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, activeTab, filters, searchQuery, loading.appointments]);

  // Check for upcoming appointments today
  useEffect(() => {
    if (loading.appointments) return;

    const today = new Date().toISOString().split("T")[0];
    const upcomingToday = appointments.filter(
      (a) => a.typeCategory === "upcoming" && a.date === today,
    );

    if (upcomingToday.length > 0) {
      showNotificationMessage(
        `You have ${upcomingToday.length} appointment(s) today!`,
        "info",
      );
    }
  }, [appointments, loading.appointments]);

  // Appointment Summary
  const upcomingCount = appointments.filter(
    (a) => a.typeCategory === "upcoming",
  ).length;
  const completedCount = appointments.filter(
    (a) => a.status === "completed",
  ).length;
  const cancelledCount = appointments.filter(
    (a) => a.status === "cancelled",
  ).length;

  const showNotificationMessage = (
    message: string,
    type: "success" | "error" | "info",
  ) => {
    setNotification({ message, type });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  // Handle successful appointment booking
  const handleAppointmentBooked = async () => {
    await fetchAllData(); // Refresh data
    setShowBookModal(false);
    showNotificationMessage("Appointment booked successfully!", "success");
  };

  // Handle view appointment details
  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  // Handle edit appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment({ ...appointment });
    setShowEditModal(true);
  };

  // Handle save edited appointment
  const handleSaveEdit = async (updatedAppointment: Appointment) => {
    try {
      await updateDoc(doc(db, "appointments", updatedAppointment.id), {
        date: updatedAppointment.date,
        time: updatedAppointment.time,
        reason: updatedAppointment.reason,
        status: updatedAppointment.status,
        updatedAt: serverTimestamp(),
      });

      await fetchAllData(); // Refresh data
      setShowEditModal(false);
      setEditingAppointment(null);
      showNotificationMessage("Appointment updated successfully!", "success");
    } catch (error) {
      console.error("Error updating appointment:", error);
      showNotificationMessage("Failed to update appointment", "error");
    }
  };

  // Handle delete appointment
  const handleDeleteAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  // Confirm delete appointment
  const handleConfirmDelete = async () => {
    if (!selectedAppointment) return;

    try {
      await deleteDoc(doc(db, "appointments", selectedAppointment.id));

      await fetchAllData(); // Refresh data
      setShowDeleteModal(false);
      setSelectedAppointment(null);
      showNotificationMessage("Appointment cancelled successfully!", "success");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      showNotificationMessage("Failed to cancel appointment", "error");
    }
  };

  const handleReschedule = async (
    appointmentId: string,
    newDate: string,
    newTime: string,
  ) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        date: newDate,
        time: newTime,
        status: "pending",
        updatedAt: serverTimestamp(),
      });

      await fetchAllData(); // Refresh data
      showNotificationMessage(
        "Appointment rescheduled successfully!",
        "success",
      );
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      showNotificationMessage("Failed to reschedule appointment", "error");
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });

      await fetchAllData(); // Refresh data
      showNotificationMessage("Appointment cancelled successfully!", "success");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      showNotificationMessage("Failed to cancel appointment", "error");
    }
  };

  const handleDownloadDetails = (appointment: Appointment) => {
    const content = `
      MWN Healthcare - Appointment Details
      ====================================
      
      Appointment Token: ${appointment.token}
      Status: ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
      
      Doctor Information:
      ------------------
      Name: ${appointment.doctorName}
      Specialization: ${appointment.doctorSpecialization}
      
      Appointment Details:
      -------------------
      Date: ${formatDateForDisplay(appointment.date)}
      Time: ${appointment.time}
      Branch: ${appointment.branch}
      Reason: ${appointment.reason}
      Duration: ${appointment.duration}
      Priority: ${appointment.priority}
      
      Patient Information:
      --------------------
      Name: ${appointment.patientName}
      Age: ${appointment.patientAge}
      Gender: ${appointment.patientGender}
      Phone: ${appointment.patientPhone}
      
      Medical Details:
      ----------------
      ${appointment.symptoms.length > 0 ? `Symptoms: ${appointment.symptoms.join(", ")}` : "No symptoms reported"}
      ${appointment.labReports.length > 0 ? `Lab Reports: ${appointment.labReports.join(", ")}` : "No lab reports"}
      Previous Visits: ${appointment.previousVisits}
      Insurance: ${appointment.insurance}
      
      ====================================
      Booked on: ${formatDateForDisplay(appointment.createdAt)}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MWN-Appointment-${appointment.token}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotificationMessage("Appointment details downloaded!", "success");
  };

  const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
    const config = {
      confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon },
      completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
    };

    const { color, icon: Icon } = config[status];

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}
      >
        <Icon className="w-4 h-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get time in AM/PM format
  const formatTime = (time: string): string => {
    // If time is already in AM/PM format, return as is
    if (time.includes("AM") || time.includes("PM")) {
      return time;
    }
    // Otherwise, format it (assuming it's in HH:MM format)
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  // Action buttons component
  const renderActionButtons = (appointment: Appointment) => {
    const isPast =
      appointment.typeCategory === "past" ||
      appointment.status === "completed" ||
      appointment.status === "cancelled";

    if (isPast) {
      return (
        <button
          onClick={() => handleViewAppointment(appointment)}
          className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </button>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleViewAppointment(appointment)}
          className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </button>
        {appointment.status !== "cancelled" && (
          <>
            <button
              onClick={() => handleEditAppointment(appointment)}
              className="flex items-center px-3 py-1.5 text-sm text-amber-600 hover:text-amber-800 transition-colors"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button
              onClick={() => handleDeleteAppointment(appointment)}
              className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Cancel
            </button>
          </>
        )}
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-xl bg-gray-200"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="flex space-x-4">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Generate doctor avatar URL (using DiceBear API)
  const getDoctorAvatar = (name: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black overflow-y-auto">
      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-64 lg:pt-6 lg:px-6 transition-all duration-300 ease-in-out text-black">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  My Appointments
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage and schedule your medical appointments
                </p>
              </div>
              <button
                onClick={() => setShowBookModal(true)}
                disabled={loading.appointments}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CalendarPlus className="w-5 h-5 mr-2" />
                Book New Appointment
              </button>
            </div>

            {/* Appointment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">
                      Upcoming Appointments
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {upcomingCount}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-green-50">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {completedCount}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-red-100 to-red-50">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {cancelledCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6 text-black">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by doctor name, branch, date, or token..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <select
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                    value={filters.branch}
                    onChange={(e) =>
                      setFilters({ ...filters, branch: e.target.value })
                    }
                  >
                    <option value="">All Branches</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                    value={filters.doctor}
                    onChange={(e) =>
                      setFilters({ ...filters, doctor: e.target.value })
                    }
                  >
                    <option value="">All Doctors</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                  >
                    <option value="">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => {
                      setFilters({ branch: "", doctor: "", status: "" });
                      setSearchQuery("");
                    }}
                    className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex space-x-2 border-b border-gray-200">
                <button
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "upcoming"
                      ? "border-[#0A8F7A] text-[#0A8F7A]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("upcoming")}
                >
                  Upcoming ({upcomingCount})
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "past"
                      ? "border-[#0A8F7A] text-[#0A8F7A]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("past")}
                >
                  Past (
                  {appointments.filter((a) => a.typeCategory === "past").length}
                  )
                </button>
              </div>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
              {loading.appointments ? (
                <LoadingSkeleton />
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No appointments found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || Object.values(filters).some((f) => f)
                      ? "Try adjusting your filters"
                      : `You have no ${activeTab} appointments yet`}
                  </p>
                  {activeTab === "upcoming" && (
                    <button
                      onClick={() => setShowBookModal(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                      <CalendarPlus className="w-5 h-5 mr-2" />
                      Book Your First Appointment
                    </button>
                  )}
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Doctor Info */}
                        <div className="flex items-start space-x-4">
                          <img
                            src={getDoctorAvatar(
                              appointment.doctorName || "Doctor",
                            )}
                            alt={appointment.doctorName}
                            className="w-16 h-16 rounded-xl bg-gray-100"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.doctorName}
                            </h3>
                            <p className="text-gray-600">
                              {appointment.doctorSpecialization}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                              <span className="inline-flex items-center text-sm text-gray-500">
                                <MapPin className="w-4 h-4 mr-1" />
                                {appointment.branch || "Colombo"}
                              </span>
                              <span className="inline-flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDateForDisplay(appointment.date)}
                              </span>
                              <span className="inline-flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatTime(appointment.time)}
                              </span>
                              <span className="inline-flex items-center text-sm text-gray-500">
                                <FileText className="w-4 h-4 mr-1" />
                                Token: {appointment.token}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col items-end space-y-3">
                          <StatusBadge status={appointment.status} />
                          {renderActionButtons(appointment)}
                        </div>
                      </div>

                      {/* Appointment Reason */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Reason:</span>{" "}
                          {appointment.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Notification */}
      {showNotification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border ${
            notification.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBookModal && (
        <BookAppointmentModal
          isOpen={showBookModal}
          onClose={() => setShowBookModal(false)}
          onAppointmentBooked={handleAppointmentBooked}
          patientId={patientId}
          patientName={patientName}
        />
      )}

      {/* View Appointment Modal */}
      {showViewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Appointment Details
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Doctor Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <img
                    src={getDoctorAvatar(
                      selectedAppointment.doctorName || "Doctor",
                    )}
                    alt={selectedAppointment.doctorName}
                    className="w-20 h-20 rounded-xl bg-white"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedAppointment.doctorName}
                    </h3>
                    <p className="text-gray-600">
                      {selectedAppointment.doctorSpecialization}
                    </p>
                    <StatusBadge status={selectedAppointment.status} />
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Token Number
                      </label>
                      <p className="text-lg font-semibold text-gray-900 font-mono">
                        {selectedAppointment.token}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Date
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDateForDisplay(selectedAppointment.date)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Branch Location
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedAppointment.branch || "Colombo"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Appointment Reason
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedAppointment.reason}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Time Slot
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatTime(selectedAppointment.time)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Duration
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedAppointment.duration}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Priority
                      </label>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {selectedAppointment.priority}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <StatusBadge status={selectedAppointment.status} />
                    </div>
                  </div>
                </div>

                {/* Symptoms */}
                {selectedAppointment.symptoms &&
                  selectedAppointment.symptoms.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-3">
                        Reported Symptoms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAppointment.symptoms.map((symptom, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Lab Reports */}
                {selectedAppointment.labReports &&
                  selectedAppointment.labReports.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-3">
                        Lab Reports
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAppointment.labReports.map((report, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {report}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Patient Information */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3">
                    Patient Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-green-700">Name</p>
                      <p className="font-semibold text-green-900">
                        {selectedAppointment.patientName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Age</p>
                      <p className="font-semibold text-green-900">
                        {selectedAppointment.patientAge}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Gender</p>
                      <p className="font-semibold text-green-900">
                        {selectedAppointment.patientGender}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Phone</p>
                      <p className="font-semibold text-green-900">
                        {selectedAppointment.patientPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Previous Visits</p>
                      <p className="font-semibold text-green-900">
                        {selectedAppointment.previousVisits}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Insurance</p>
                      <p className="font-semibold text-green-900">
                        {selectedAppointment.insurance}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleDownloadDetails(selectedAppointment)}
                  className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Details
                </button>
                {selectedAppointment.status !== "cancelled" &&
                  selectedAppointment.typeCategory === "upcoming" && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setTimeout(
                          () => handleEditAppointment(selectedAppointment),
                          100,
                        );
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-xl hover:shadow-lg transition-colors"
                    >
                      Edit Appointment
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && editingAppointment && (
        <EditAppointmentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
          appointment={editingAppointment}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Cancel Appointment
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to cancel this appointment? This action
                cannot be undone.
              </p>

              <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
                <div className="text-center">
                  <p className="font-medium text-red-800 mb-1">
                    {selectedAppointment.doctorName}
                  </p>
                  <p className="text-sm text-red-700">
                    {selectedAppointment.doctorSpecialization}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    {formatDateForDisplay(selectedAppointment.date)} at{" "}
                    {formatTime(selectedAppointment.time)}
                  </p>
                  <p className="text-sm text-red-600">
                    Token: {selectedAppointment.token}
                  </p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                >
                  Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
