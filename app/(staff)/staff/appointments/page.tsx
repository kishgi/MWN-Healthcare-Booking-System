"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../../components/StaffSidebar";
import { db } from "@/app/firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import {
  Calendar,
  Clock,
  User,
  Users,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  Plus,
  Eye,
  Edit,
  Tag,
  AlertTriangle,
  Stethoscope,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  contact?: string;
  email?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  branch?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  reason?: string;
  type?: string;
  priority?: string;
  bookedBy: string;
  bookedAt: string;
}

export default function StaffAppointmentPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    reason: "",
    type: "new",
    priority: "medium",
  });

  // Message state
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch patients
      const patientsSnapshot = await getDocs(collection(db, "patients"));
      const patientsData = patientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Patient[];
      setPatients(patientsData);

      // Fetch doctors (users with role="doctor")
      const usersSnapshot = await getDocs(collection(db, "users"));
      const doctorsData = usersSnapshot.docs
        .filter((doc) => doc.data().role === "doctor")
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Doctor[];
      setDoctors(doctorsData);

      // Fetch appointments
      const appointmentsSnapshot = await getDocs(
        collection(db, "appointments"),
      );
      const appointmentsData = await Promise.all(
        appointmentsSnapshot.docs.map(async (doc) => {
          const data = doc.data();

          // Get patient name
          let patientName = "Unknown";
          if (data.patientName) {
            patientName = data.patientName;
          } else if (data.patientId) {
            try {
              const patientDoc = patientsData.find(
                (p) => p.id === data.patientId,
              );
              if (patientDoc) patientName = patientDoc.name;
            } catch (error) {
              console.error("Error fetching patient name:", error);
            }
          }

          // Get doctor name
          let doctorName = "Unknown";
          if (data.doctorId) {
            try {
              const doctorDoc = doctorsData.find((d) => d.id === data.doctorId);
              if (doctorDoc) doctorName = doctorDoc.name;
            } catch (error) {
              console.error("Error fetching doctor name:", error);
            }
          }

          return {
            id: doc.id,
            patientId: data.patientId || "",
            doctorId: data.doctorId || "",
            patientName,
            doctorName,
            date: data.date || "",
            time: data.time || "",
            status: data.status || "pending",
            reason: data.reason || "",
            type: data.type || "new",
            priority: data.priority || "medium",
            bookedBy: data.bookedBy || "staff",
            bookedAt: data.bookedAt || "",
          } as Appointment;
        }),
      );
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({
        text: "Error loading data. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validation
    if (
      !formData.patientId ||
      !formData.doctorId ||
      !formData.date ||
      !formData.time
    ) {
      setMessage({
        text: "Please fill in all required fields.",
        type: "error",
      });
      setSubmitting(false);
      return;
    }

    try {
      // Get patient and doctor details
      const selectedPatient = patients.find((p) => p.id === formData.patientId);
      const selectedDoctor = doctors.find((d) => d.id === formData.doctorId);

      if (!selectedPatient || !selectedDoctor) {
        setMessage({
          text: "Invalid patient or doctor selected.",
          type: "error",
        });
        setSubmitting(false);
        return;
      }

      // Generate a unique ID for the appointment
      const appointmentId = `APP-${Date.now()}`;
      const token = `TK-${appointments.length + 1001}`;

      // Create appointment document
      await addDoc(collection(db, "appointments"), {
        id: appointmentId,
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        patientName: selectedPatient.name,
        patientAge: selectedPatient.age,
        patientGender: selectedPatient.gender,
        patientPhone: selectedPatient.contact,
        doctorName: selectedDoctor.name,
        date: formData.date,
        time: formData.time,
        token: token,
        status: "confirmed",
        reason: formData.reason || "Appointment booked by staff",
        type: formData.type,
        priority: formData.priority,
        bookedBy: "STF-001", // This should come from logged-in staff session
        bookedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });

      // Success message
      setMessage({
        text: "Appointment created successfully!",
        type: "success",
      });

      // Reset form
      setFormData({
        patientId: "",
        doctorId: "",
        date: "",
        time: "",
        reason: "",
        type: "new",
        priority: "medium",
      });

      // Refresh appointments list
      fetchAllData();
    } catch (error) {
      console.error("Error creating appointment:", error);
      setMessage({
        text: "Error creating appointment. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      appointment.doctorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (appointment.reason &&
        appointment.reason.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" || appointment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      confirmed: {
        color: "bg-green-100 text-green-800 border border-green-200",
        icon: CheckCircle,
        textColor: "text-green-700",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        icon: Clock,
        textColor: "text-yellow-700",
      },
      completed: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: CheckCircle,
        textColor: "text-blue-700",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: XCircle,
        textColor: "text-red-700",
      },
    };

    const statusConfig =
      config[status as keyof typeof config] || config.pending;
    const Icon = statusConfig.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${statusConfig.color}`}
      >
        <Icon className="w-3.5 h-3.5 mr-1.5" />
        <span className={statusConfig.textColor}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800 border border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      high: "bg-orange-100 text-orange-800 border border-orange-200",
      emergency: "bg-red-100 text-red-800 border border-red-200",
    };

    return (
      <span
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800 border border-gray-200"}`}
      >
        <Tag className="w-3 h-3 inline mr-1.5" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      new: "bg-purple-100 text-purple-800 border border-purple-200",
      "follow-up": "bg-cyan-100 text-cyan-800 border border-cyan-200",
      review: "bg-indigo-100 text-indigo-800 border border-indigo-200",
      emergency: "bg-red-100 text-red-800 border border-red-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded text-xs font-medium ${colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-[#0A8F7A] mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Loading appointments...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Appointments
                </h1>
                <p className="text-gray-700 mt-2 text-lg">
                  Create and manage appointments for patients
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#0A8F7A]" />
                    <span className="text-gray-800 font-semibold">
                      {appointments.length}
                    </span>
                    <span className="text-gray-600">total appointments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Create Appointment Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-7 sticky top-6">
                <div className="flex items-center justify-between mb-7">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Plus className="w-6 h-6 mr-3 text-[#0A8F7A]" />
                    Create New Appointment
                  </h2>
                  <div className="w-10 h-10 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                </div>

                {message.text && (
                  <div
                    className={`mb-6 p-5 rounded-xl ${
                      message.type === "success"
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200"
                        : "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center">
                      {message.type === "success" ? (
                        <CheckCircle className="w-6 h-6 mr-3 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-6 h-6 mr-3 text-red-600 flex-shrink-0" />
                      )}
                      <span className="font-medium">{message.text}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Patient Selection */}
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2 text-gray-600" />
                      Select Patient *
                    </label>
                    <select
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-[#0A8F7A]/30 focus:border-[#0A8F7A] bg-white text-gray-800 text-base font-medium shadow-sm transition-all"
                    >
                      <option value="" className="text-gray-500">
                        👤 Choose a patient...
                      </option>
                      {patients.map((patient) => (
                        <option
                          key={patient.id}
                          value={patient.id}
                          className="text-gray-800 py-2"
                        >
                          {patient.name}{" "}
                          {patient.age ? `(${patient.age}y)` : ""}{" "}
                          {patient.gender ? `• ${patient.gender}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Doctor Selection */}
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <Stethoscope className="w-5 h-5 mr-2 text-gray-600" />
                      Select Doctor *
                    </label>
                    <select
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-[#0A8F7A]/30 focus:border-[#0A8F7A] bg-white text-gray-800 text-base font-medium shadow-sm transition-all"
                    >
                      <option value="" className="text-gray-500">
                        👨‍⚕️ Choose a doctor...
                      </option>
                      {doctors.map((doctor) => (
                        <option
                          key={doctor.id}
                          value={doctor.id}
                          className="text-gray-800 py-2"
                        >
                          {doctor.name} • {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-[#0A8F7A]/30 focus:border-[#0A8F7A] bg-white text-gray-800 text-base font-medium shadow-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-gray-600" />
                        Time *
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-[#0A8F7A]/30 focus:border-[#0A8F7A] bg-white text-gray-800 text-base font-medium shadow-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Appointment Type */}
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3">
                      📋 Appointment Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-[#0A8F7A]/30 focus:border-[#0A8F7A] bg-white text-gray-800 text-base font-medium shadow-sm transition-all"
                    >
                      <option value="new" className="text-gray-800">
                        🆕 New Patient
                      </option>
                      <option value="follow-up" className="text-gray-800">
                        🔄 Follow-up
                      </option>
                      <option value="review" className="text-gray-800">
                        📊 Review
                      </option>
                      <option value="emergency" className="text-gray-800">
                        🚨 Emergency
                      </option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3">
                      ⚡ Priority Level
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-[#0A8F7A]/30 focus:border-[#0A8F7A] bg-white text-gray-800 text-base font-medium shadow-sm transition-all"
                    >
                      <option value="low" className="text-green-700">
                        🟢 Low Priority
                      </option>
                      <option value="medium" className="text-yellow-700">
                        🟡 Medium Priority
                      </option>
                      <option value="high" className="text-orange-700">
                        🟠 High Priority
                      </option>
                      <option value="emergency" className="text-red-700">
                        🔴 Emergency
                      </option>
                    </select>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-base font-semibold text-gray-800 mb-3">
                      📝 Reason for Visit
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Describe the reason for this appointment..."
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-[#0A8F7A]/30 focus:border-[#0A8F7A] bg-white text-gray-800 text-base font-medium shadow-sm transition-all resize-none placeholder-gray-400"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-bold py-4 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-lg shadow-lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Creating Appointment...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5 mr-3" />
                        Create Appointment
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column - Appointments List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Calendar className="w-6 h-6 mr-3 text-[#0A8F7A]" />
                        Recent Appointments
                      </h2>
                      <p className="text-gray-600 mt-2">
                        Showing {filteredAppointments.length} of{" "}
                        {appointments.length} appointments
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search patients, doctors, or reasons..."
                          className="pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:ring-3 focus:ring-[#0A8F7A]/30 focus:border-[#0A8F7A] w-full sm:w-64 bg-white text-gray-800 shadow-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      {/* Filter */}
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-5 py-3 border-2 border-gray-300 rounded-xl text-base font-medium hover:bg-gray-50 flex items-center justify-center shadow-sm"
                      >
                        <Filter className="w-5 h-5 mr-2" />
                        Filter
                        <ChevronDown
                          className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Filter Options */}
                  {showFilters && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setFilterStatus("all")}
                          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            filterStatus === "all"
                              ? "bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                          }`}
                        >
                          All Status
                        </button>
                        <button
                          onClick={() => setFilterStatus("confirmed")}
                          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            filterStatus === "confirmed"
                              ? "bg-green-100 text-green-800 border-2 border-green-300 shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                          }`}
                        >
                          ✅ Confirmed
                        </button>
                        <button
                          onClick={() => setFilterStatus("pending")}
                          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            filterStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-300 shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                          }`}
                        >
                          ⏳ Pending
                        </button>
                        <button
                          onClick={() => setFilterStatus("completed")}
                          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            filterStatus === "completed"
                              ? "bg-blue-100 text-blue-800 border-2 border-blue-300 shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                          }`}
                        >
                          ✅ Completed
                        </button>
                        <button
                          onClick={() => setFilterStatus("cancelled")}
                          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            filterStatus === "cancelled"
                              ? "bg-red-100 text-red-800 border-2 border-red-300 shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                          }`}
                        >
                          ❌ Cancelled
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Appointments List */}
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {filteredAppointments.length === 0 ? (
                    <div className="px-8 py-16 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        No appointments found
                      </h3>
                      <p className="text-gray-600 text-lg mb-6">
                        {searchQuery || filterStatus !== "all"
                          ? "Try adjusting your search or filters"
                          : "No appointments have been created yet"}
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setFilterStatus("all");
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="px-8 py-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 border-b border-gray-100"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center shadow-sm">
                                <User className="w-7 h-7 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                  <div>
                                    <h4 className="text-xl font-bold text-gray-900">
                                      {appointment.patientName}
                                    </h4>
                                    <p className="text-gray-700 font-medium mt-1">
                                      👨‍⚕️ With Dr. {appointment.doctorName}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    {getStatusBadge(appointment.status)}
                                    {appointment.priority &&
                                      getPriorityBadge(appointment.priority)}
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-base text-gray-700 mb-3">
                                  <span className="flex items-center font-medium">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                    {formatDate(appointment.date)}
                                  </span>
                                  <span className="flex items-center font-medium">
                                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                    {appointment.time}
                                  </span>
                                  {appointment.type && (
                                    <span className="flex items-center">
                                      <Tag className="w-4 h-4 mr-2 text-gray-500" />
                                      {getTypeBadge(appointment.type)}
                                    </span>
                                  )}
                                </div>

                                {appointment.reason && (
                                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="flex items-start">
                                      <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                          Reason for Visit:
                                        </p>
                                        <p className="text-gray-800 font-medium">
                                          {appointment.reason}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button className="px-5 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 font-semibold rounded-xl hover:shadow-md border border-blue-200 transition-all flex items-center">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </button>
                            <button className="px-5 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 font-semibold rounded-xl hover:shadow-md border border-amber-200 transition-all flex items-center">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {filteredAppointments.length > 0 && (
                  <div className="px-8 py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-gray-700">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">
                          Showing {filteredAppointments.length} appointments
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setSearchQuery("")}
                          className="px-5 py-2.5 text-[#0A8F7A] font-semibold hover:text-[#06D6A0] transition-colors flex items-center"
                        >
                          🔄 Clear filters
                        </button>
                        <button
                          onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                          }
                          className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all flex items-center"
                        >
                          ↑ Scroll to top
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
