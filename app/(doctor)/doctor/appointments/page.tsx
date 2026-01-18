"use client";

import { useState, useEffect } from "react";
import DoctorSidebar from "../../../components/DoctorSidebar";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  User,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  FileText,
  Phone,
  Video,
  Download,
  Printer,
} from "lucide-react";
import {
  Appointment,
  getDoctorAppointments,
  getDoctorDetails,
} from "@/app/api/services/doctor";

/* ---------------- BADGE COMPONENTS ---------------- */
const TypeBadge = ({ type }: { type?: string }) => {
  if (!type) return null;

  const colors: Record<string, string> = {
    new: "bg-green-100 text-green-700",
    "follow-up": "bg-blue-100 text-blue-700",
    review: "bg-purple-100 text-purple-700",
  };

  const colorClass = colors[type] || "bg-gray-100 text-gray-700";

  return (
    <span className={`px-2 py-1 text-xs rounded ${colorClass}`}>{type}</span>
  );
};

const PriorityBadge = ({ priority }: { priority?: string }) => {
  if (!priority) return null;

  const colors: Record<string, string> = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
    emergency: "bg-red-200 text-red-800",
  };

  const colorClass = colors[priority] || "bg-gray-100 text-gray-700";

  return (
    <span className={`px-2 py-1 text-xs rounded ${colorClass}`}>
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) return null;

  const colors: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    "no-show": "bg-gray-100 text-gray-700",
  };

  const colorClass = colors[status] || "bg-gray-100 text-gray-700";

  return (
    <span className={`px-2 py-1 text-xs rounded ${colorClass}`}>{status}</span>
  );
};

/* ---------------- COMPONENT ---------------- */
export default function DoctorAppointments() {
  const doctorId = "DR-001";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctor, setDoctor] = useState<{
    name: string;
    specialization: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    type: "",
    date: "",
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Appointment;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showFilters, setShowFilters] = useState(false);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const doctorData = await getDoctorDetails(doctorId);
        setDoctor({
          name: doctorData?.name || "Dr. John Doe",
          specialization: doctorData?.specialization || "General Physician",
        });

        const data = await getDoctorAppointments(doctorId);
        setAppointments(data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        // Set default data to prevent crash
        setDoctor({
          name: "Dr. Sarah Johnson",
          specialization: "Cardiology",
        });
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [doctorId]);

  /* ---------------- HELPERS ---------------- */
  const convertTimeToMinutes = (timeStr?: string) => {
    if (!timeStr) return 0;

    try {
      // Handle both "02:30 PM" and "14:30" formats
      const [time, modifier] = timeStr.split(" ");
      if (!time) return 0;

      let [hours, minutes] = time.split(":").map(Number);

      if (modifier) {
        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
      }

      return hours * 60 + (minutes || 0);
    } catch (error) {
      return 0;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";

    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return dateStr; // Return original string if parsing fails
    }
  };

  /* ---------------- FILTER & SORT ---------------- */
  const filteredAppointments = appointments
    .filter((a) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = (a.patientName || "").toLowerCase().includes(q);
        const matchesToken = (a.token || "").toLowerCase().includes(q);
        const matchesReason = (a.reason || "").toLowerCase().includes(q);
        const matchesPhone = (a.patientPhone || "").includes(searchQuery);

        if (!matchesName && !matchesToken && !matchesReason && !matchesPhone) {
          return false;
        }
      }

      if (filters.status && a.status !== filters.status) return false;
      if (filters.priority && a.priority !== filters.priority) return false;
      if (filters.type && a.type !== filters.type) return false;
      if (filters.date && a.date !== filters.date) return false;

      return true;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;

      const { key, direction } = sortConfig;
      let aVal = a[key];
      let bVal = b[key];

      // Handle undefined values
      if (aVal === undefined || aVal === null) aVal = "";
      if (bVal === undefined || bVal === null) bVal = "";

      if (key === "date") {
        try {
          const aDate = aVal ? new Date(aVal as string).getTime() : 0;
          const bDate = bVal ? new Date(bVal as string).getTime() : 0;
          return direction === "asc" ? aDate - bDate : bDate - aDate;
        } catch {
          return 0;
        }
      }

      if (key === "time") {
        const aTime = convertTimeToMinutes(aVal as string);
        const bTime = convertTimeToMinutes(bVal as string);
        return direction === "asc" ? aTime - bTime : bTime - aTime;
      }

      // Default string comparison
      const aStr = String(aVal || "");
      const bStr = String(bVal || "");
      return direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAppointments.length / itemsPerPage),
  );
  const currentAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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

  const handleSort = (key: keyof Appointment) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1); // Reset to first page when sorting
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    currentPage * itemsPerPage,
    filteredAppointments.length,
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleStartConsultation = (appointment: Appointment) => {
    alert(`Starting consultation for ${appointment.patientName || "Patient"}`);
    // In a real app, you would navigate to consultation page
  };

  const handleViewDetails = (appointment: Appointment) => {
    alert(
      `Viewing details for ${appointment.patientName || "Patient"}\nID: ${appointment.id}`,
    );
    // In a real app, you would open a modal or navigate to details page
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "",
      priority: "",
      type: "",
      date: "",
    });
    setCurrentPage(1);
    setSortConfig(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <DoctorSidebar doctorName="Loading..." doctorSpecialization="" />
        <main className="lg:ml-64 flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A8F7A] mb-4"></div>
            <p className="text-gray-700">Loading appointments...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorSidebar
        doctorName={doctor?.name || "Dr. Sarah Johnson"}
        doctorSpecialization={doctor?.specialization || "Cardiology"}
      />

      <main className="lg:ml-64 p-4 md:p-6 text-black">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Appointments
                </h1>
                <p className="text-gray-600 mt-1">
                  View and manage all your appointments
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                  onClick={() => alert("Export functionality")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                  onClick={() => alert("Print functionality")}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total Appointments</p>
                    <p className="text-lg font-bold text-gray-900">
                      {totalAppointments}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Confirmed</p>
                    <p className="text-lg font-bold text-gray-900">
                      {confirmedCount}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-lg font-bold text-gray-900">
                      {pendingCount}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-lg font-bold text-gray-900">
                      {completedCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by patient name, token, phone, or reason..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent transition-all"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>

                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                    {showFilters ? (
                      <ChevronUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </button>

                  {/* Reset Filters */}
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
                    title="Reset all filters"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <select
                        className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent bg-white"
                        value={filters.status}
                        onChange={(e) => {
                          setFilters({ ...filters, status: e.target.value });
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No Show</option>
                      </select>

                      <select
                        className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent bg-white"
                        value={filters.priority}
                        onChange={(e) => {
                          setFilters({ ...filters, priority: e.target.value });
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="emergency">Emergency</option>
                      </select>

                      <select
                        className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent bg-white"
                        value={filters.type}
                        onChange={(e) => {
                          setFilters({ ...filters, type: e.target.value });
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Types</option>
                        <option value="new">New</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="review">Review</option>
                      </select>

                      <input
                        type="date"
                        className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent bg-white"
                        value={filters.date}
                        onChange={(e) => {
                          setFilters({ ...filters, date: e.target.value });
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("patientName")}
                      >
                        <div className="flex items-center">
                          Patient Info
                          {sortConfig?.key === "patientName" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-4 h-4 ml-1" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center">
                          Date & Time
                          {sortConfig?.key === "date" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-4 h-4 ml-1" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-1" />
                            ))}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason & Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority & Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No appointments found
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {searchQuery ||
                            Object.values(filters).some((f) => f)
                              ? "Try adjusting your search or filters"
                              : "No appointments scheduled"}
                          </p>
                          <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-[#0A8F7A] text-white rounded-lg hover:bg-[#098d78] transition-colors"
                          >
                            Clear Filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      currentAppointments.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Patient Info Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">
                                  {appointment.patientName || "Unknown Patient"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {appointment.patientAge
                                    ? `${appointment.patientAge}y • `
                                    : ""}
                                  {appointment.patientGender || "Unknown"}
                                </div>
                                {appointment.patientPhone && (
                                  <div className="text-sm text-gray-500 flex items-center mt-1">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {appointment.patientPhone}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                  Token: {appointment.token || "N/A"} • Visits:{" "}
                                  {appointment.previousVisits || 0}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Date & Time Column */}
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {formatDate(appointment.date)}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {appointment.time || "N/A"}
                              </div>
                              {appointment.duration && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Duration: {appointment.duration}
                                </div>
                              )}
                              {appointment.bookedAt && (
                                <div className="text-xs text-gray-500">
                                  Booked: {formatDate(appointment.bookedAt)}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Reason & Type Column */}
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {appointment.reason || "No reason provided"}
                            </div>
                            {appointment.type && (
                              <div className="mt-2">
                                <TypeBadge type={appointment.type} />
                              </div>
                            )}
                            {appointment.symptoms &&
                              appointment.symptoms.length > 0 && (
                                <div className="text-xs text-gray-500 mt-2">
                                  Symptoms: {appointment.symptoms.join(", ")}
                                </div>
                              )}
                            {appointment.labReports &&
                              appointment.labReports.length > 0 && (
                                <div className="text-xs text-blue-600 mt-1">
                                  Reports: {appointment.labReports.join(", ")}
                                </div>
                              )}
                          </td>

                          {/* Priority & Status Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              {appointment.priority && (
                                <PriorityBadge
                                  priority={appointment.priority}
                                />
                              )}
                              {appointment.status && (
                                <StatusBadge status={appointment.status} />
                              )}
                              {appointment.insurance && (
                                <div className="text-xs text-gray-500">
                                  Insurance: {appointment.insurance}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-2">
                              {appointment.status === "confirmed" && (
                                <button
                                  onClick={() =>
                                    handleStartConsultation(appointment)
                                  }
                                  className="px-3 py-1.5 bg-[#0A8F7A] text-white text-sm rounded hover:bg-[#098d78] transition-colors"
                                >
                                  Start Consultation
                                </button>
                              )}

                              <button
                                onClick={() => handleViewDetails(appointment)}
                                className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 flex items-center justify-center transition-colors"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View Details
                              </button>

                              <div className="flex space-x-2">
                                <button
                                  className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                  onClick={() => alert("View medical records")}
                                >
                                  <FileText className="w-3 h-3 text-gray-600" />
                                </button>
                                <button
                                  className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                  onClick={() => alert("Call patient")}
                                >
                                  <Phone className="w-3 h-3 text-gray-600" />
                                </button>
                                <button
                                  className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                  onClick={() =>
                                    alert("Start video consultation")
                                  }
                                >
                                  <Video className="w-3 h-3 text-gray-600" />
                                </button>
                                <button
                                  className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                  onClick={() => alert("More options")}
                                >
                                  <MoreVertical className="w-3 h-3 text-gray-600" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer - Pagination */}
              {filteredAppointments.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">{endIndex}</span> of{" "}
                    <span className="font-medium">
                      {filteredAppointments.length}
                    </span>{" "}
                    appointments
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                            currentPage === pageNum
                              ? "bg-[#0A8F7A] text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">
                  Appointment Types
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">New Patients</span>
                    <span className="font-medium">
                      {appointments.filter((a) => a.type === "new").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Follow-ups</span>
                    <span className="font-medium">
                      {
                        appointments.filter((a) => a.type === "follow-up")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reviews</span>
                    <span className="font-medium">
                      {appointments.filter((a) => a.type === "review").length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">
                  Priority Distribution
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">High Priority</span>
                    <span className="font-medium">
                      {
                        appointments.filter(
                          (a) =>
                            a.priority === "high" || a.priority === "emergency",
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Medium Priority
                    </span>
                    <span className="font-medium">
                      {
                        appointments.filter((a) => a.priority === "medium")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Low Priority</span>
                    <span className="font-medium">
                      {appointments.filter((a) => a.priority === "low").length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm transition-colors"
                    onClick={() => alert("Schedule new appointment")}
                  >
                    Schedule New
                  </button>
                  <button
                    className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded text-sm transition-colors"
                    onClick={() => alert("View calendar")}
                  >
                    View Calendar
                  </button>
                  <button
                    className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-sm transition-colors"
                    onClick={() => alert("Start telemedicine session")}
                  >
                    Telemedicine
                  </button>
                  <button
                    className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-sm transition-colors"
                    onClick={() => alert("View follow-up appointments")}
                  >
                    Follow-ups
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
