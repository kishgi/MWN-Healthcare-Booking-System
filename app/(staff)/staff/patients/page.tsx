"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../../components/StaffSidebar";
import {
  getAllPatients,
  getAllAppointments,
  createPatient,
  getAllDoctors,
  Patient,
  Appointment,
  Doctor,
} from "@/app/api/services/staff";
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter as FilterIcon,
  Plus,
  X,
  MessageSquare,
  Shield,
  Activity,
  Pill,
  Users,
  Stethoscope,
  AlertTriangle,
  Package,
  TrendingUp,
} from "lucide-react";

// Types
type Gender = "Male" | "Female" | "Other";
type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";
type PatientStatus = "active" | "inactive";

interface ExtendedPatient extends Patient {
  totalVisits: number;
  status: PatientStatus;
  lastVisit?: string;
  nextVisit?: string;
  registeredDate?: string;
  conditions?: string[];
  allergies?: string[];
  branch?: string;
}

export default function PatientsPage() {
  // State
  const [patients, setPatients] = useState<ExtendedPatient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    gender: "",
    status: "",
    bloodGroup: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ExtendedPatient;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentHistoryModal, setShowAppointmentHistoryModal] =
    useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] =
    useState<ExtendedPatient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>(
    [],
  );

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "",
    contact: "",
    email: "",
    address: "",
    emergencyContact: "",
    bloodGroup: "",
    medicalHistory: "",
    conditions: "",
    allergies: "",
    insurance: "",
    branch: "",
    status: "active" as PatientStatus,
  });

  // Statistics
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    newThisMonth: 0,
    appointmentsToday: 0,
  });

  // Fetch all data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data using staff.ts functions
        const [patientsData, appointmentsData, doctorsData] = await Promise.all(
          [getAllPatients(), getAllAppointments(), getAllDoctors()],
        );

        // Create a map of doctor IDs to doctor names for quick lookup
        const doctorMap = new Map<string, string>();
        doctorsData.forEach((doctor) => {
          doctorMap.set(doctor.id, doctor.name);
        });

        // Add doctor names to appointments
        const appointmentsWithDoctorNames = appointmentsData.map(
          (appointment) => ({
            ...appointment,
            doctorName: doctorMap.get(appointment.doctorId) || "Unknown Doctor",
          }),
        );

        // Process patients data - match with your seed data structure
        const processedPatients: ExtendedPatient[] = patientsData.map(
          (patient) => ({
            ...patient,
            totalVisits: 0,
            status: "active" as PatientStatus, // Default status since not in seed data
            conditions: patient.medicalHistory
              ? patient.medicalHistory.split(",").map((c) => c.trim())
              : [],
            allergies: [], // Not in your seed data
            registeredDate:
              patient.createdAt?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
            branch: patient.branch || "Colombo", // Default branch from seed data
          }),
        );

        // Calculate total visits for each patient and get visit dates
        const patientsWithVisits = processedPatients.map((patient) => {
          const patientAppointments = appointmentsWithDoctorNames.filter(
            (appt) => appt.patientId === patient.id,
          );

          // Get last visit date
          const lastVisit =
            patientAppointments.length > 0
              ? patientAppointments.sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )[0]?.date
              : undefined;

          // Get next scheduled visit (confirmed or pending appointments in the future)
          const now = new Date();
          const nextVisit = patientAppointments
            .filter(
              (appt) =>
                (appt.status === "confirmed" || appt.status === "pending") &&
                new Date(appt.date) >= now,
            )
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            )[0]?.date;

          return {
            ...patient,
            totalVisits: patientAppointments.length,
            lastVisit,
            nextVisit,
          };
        });

        setPatients(patientsWithVisits);
        setAppointments(appointmentsWithDoctorNames);
        setDoctors(doctorsData);

        // Calculate statistics
        const today = new Date().toISOString().split("T")[0];
        const todayAppointments = appointmentsWithDoctorNames.filter(
          (appt) => appt.date === today,
        );

        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const patientsThisMonth = patientsWithVisits.filter((patient) => {
          const regDate = new Date(patient.registeredDate || "");
          return (
            regDate.getMonth() === thisMonth &&
            regDate.getFullYear() === thisYear
          );
        });

        setStats({
          totalPatients: patientsWithVisits.length,
          activePatients: patientsWithVisits.filter(
            (p) => p.status === "active",
          ).length,
          newThisMonth: patientsThisMonth.length,
          appointmentsToday: todayAppointments.length,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters and search
  const filteredPatients = patients
    .filter((patient) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          patient.name.toLowerCase().includes(searchLower) ||
          patient.contact?.toLowerCase().includes(searchLower) ||
          patient.email?.toLowerCase().includes(searchLower) ||
          patient.id.toLowerCase().includes(searchLower) ||
          patient.insurance?.toLowerCase().includes(searchLower) ||
          patient.branch?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Gender filter
      if (filters.gender && patient.gender !== filters.gender) return false;

      // Status filter
      if (filters.status && patient.status !== filters.status) return false;

      // Blood group filter
      if (filters.bloodGroup && patient.bloodGroup !== filters.bloodGroup)
        return false;

      return true;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;

      const { key, direction } = sortConfig;
      let aValue: any = a[key];
      let bValue: any = b[key];

      // Handle date sorting
      if (
        key === "registeredDate" ||
        key === "lastVisit" ||
        key === "nextVisit"
      ) {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Handle numeric sorting
      if (key === "age" || key === "totalVisits") {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (aValue < bValue) {
        return direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  // Calculate pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  // Handle sort
  const handleSort = (key: keyof ExtendedPatient) => {
    let direction: "asc" | "desc" = "asc";

    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }

    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Open Patient Details Modal
  const handleViewPatientDetails = (patient: ExtendedPatient) => {
    setSelectedPatient(patient);

    // Get patient appointments
    const patientAppts = appointments.filter(
      (appt) => appt.patientId === patient.id,
    );
    setPatientAppointments(patientAppts);

    setShowPatientModal(true);
  };

  // Open Appointment History Modal
  const handleViewAppointmentHistory = (patient: ExtendedPatient) => {
    setSelectedPatient(patient);
    const patientAppts = appointments.filter(
      (appt) => appt.patientId === patient.id,
    );
    setPatientAppointments(patientAppts);
    setShowAppointmentHistoryModal(true);
  };

  // Handle New Patient Registration
  const handleAddNewPatient = async () => {
    if (!newPatient.name || !newPatient.contact) {
      alert("Please fill in name and contact information");
      return;
    }

    try {
      // Prepare patient data matching your seed structure
      const patientData = {
        name: newPatient.name,
        age: newPatient.age ? parseInt(newPatient.age) : undefined,
        gender: newPatient.gender || undefined,
        contact: newPatient.contact,
        email: newPatient.email || undefined,
        address: newPatient.address || undefined,
        emergencyContact: newPatient.emergencyContact || undefined,
        medicalHistory: newPatient.medicalHistory || undefined,
        bloodGroup: (newPatient.bloodGroup as BloodGroup) || undefined,
        insurance: newPatient.insurance || undefined,
        branch: newPatient.branch || "Colombo", // Default branch
      };

      // Add to Firestore using staff.ts function
      const createdPatient = await createPatient(patientData);

      // Create patient object for state
      const newPatientObj: ExtendedPatient = {
        ...createdPatient,
        totalVisits: 0,
        status: newPatient.status,
        conditions: newPatient.conditions
          ? newPatient.conditions.split(",").map((c) => c.trim())
          : [],
        allergies: newPatient.allergies
          ? newPatient.allergies.split(",").map((a) => a.trim())
          : [],
        registeredDate: new Date().toISOString(),
        lastVisit: undefined,
        nextVisit: undefined,
        branch: newPatient.branch || "Colombo",
      };

      // Update state
      setPatients([newPatientObj, ...patients]);
      setStats((prev) => ({
        ...prev,
        totalPatients: prev.totalPatients + 1,
        activePatients: prev.activePatients + 1,
      }));

      setShowNewPatientModal(false);
      resetNewPatientForm();
      alert("Patient registered successfully!");
    } catch (error) {
      console.error("Error adding patient:", error);
      alert("Error registering patient. Please try again.");
    }
  };

  // Reset new patient form
  const resetNewPatientForm = () => {
    setNewPatient({
      name: "",
      age: "",
      gender: "",
      contact: "",
      email: "",
      address: "",
      emergencyContact: "",
      bloodGroup: "",
      medicalHistory: "",
      conditions: "",
      allergies: "",
      insurance: "",
      branch: "Colombo",
      status: "active",
    });
  };

  // Handle delete patient
  const handleDeletePatient = (patient: ExtendedPatient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  // Confirm delete patient
  const handleConfirmDelete = async () => {
    if (!selectedPatient) return;

    try {
      // Note: In staff.ts we don't have a delete function yet
      // For now, we'll just remove from state
      // In a real app, you'd need to add a deletePatient function in staff.ts

      // Update state
      setPatients(patients.filter((p) => p.id !== selectedPatient.id));
      setStats((prev) => ({
        ...prev,
        totalPatients: prev.totalPatients - 1,
        activePatients:
          prev.activePatients - (selectedPatient.status === "active" ? 1 : 0),
      }));

      setShowDeleteModal(false);
      setSelectedPatient(null);
      alert(
        "Patient deleted successfully! (Frontend only - implement backend delete)",
      );
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("Error deleting patient. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Status Badge component
  const StatusBadge = ({ status }: { status: PatientStatus }) => {
    const config = {
      active: {
        color: "bg-green-100 text-green-800 border border-green-200",
        icon: CheckCircle,
      },
      inactive: {
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: XCircle,
      },
    };

    const { color, icon: Icon } = config[status];

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Appointment Status Badge
  const AppointmentStatusBadge = ({
    status,
  }: {
    status: AppointmentStatus;
  }) => {
    const config = {
      confirmed: {
        color: "bg-green-100 text-green-800 border border-green-200",
        icon: CheckCircle,
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        icon: Clock,
      },
      completed: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: CheckCircle,
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: XCircle,
      },
      "no-show": {
        color: "bg-gray-100 text-gray-800 border border-gray-200",
        icon: AlertCircle,
      },
    };

    const { color, icon: Icon } = config[status];

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilters({ gender: "", status: "", bloodGroup: "" });
    setSortConfig(null);
    setCurrentPage(1);
  };

  // Get patient initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-black">
        <Sidebar />
        <main className="lg:ml-64 p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-[#0A8F7A] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Loading Patient Data
            </h1>
            <p className="text-gray-600">
              Fetching patient records from the database...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-black">
      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-64 p-4 md:p-6 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Patient Management
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Register, search, and manage patient records
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowNewPatientModal(true)}
                  className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 shadow-md"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Register New Patient
                </button>
                <button className="inline-flex items-center px-5 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200">
                  <Download className="w-5 h-5 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Total Patients
                    </p>
                    <p className="text-4xl font-bold text-gray-900">
                      {stats.totalPatients}
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                      All registered patients
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Active Patients
                    </p>
                    <p className="text-4xl font-bold text-gray-900">
                      {stats.activePatients}
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                      Currently active
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      New This Month
                    </p>
                    <p className="text-4xl font-bold text-gray-900">
                      {stats.newThisMonth}
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                      Recent registrations
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-amber-50 to-orange-100 rounded-xl flex items-center justify-center shadow-sm">
                    <TrendingUp className="w-7 h-7 text-amber-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Appointments Today
                    </p>
                    <p className="text-4xl font-bold text-gray-900">
                      {stats.appointmentsToday}
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                      Scheduled for today
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Calendar className="w-7 h-7 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by patient name, ID, phone, email, insurance, or branch..."
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base font-medium"
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
                  className="px-5 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center font-medium"
                >
                  <FilterIcon className="w-5 h-5 mr-2" />
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
                  className="px-5 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  title="Reset all filters"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A]"
                        value={filters.gender}
                        onChange={(e) => {
                          setFilters({ ...filters, gender: e.target.value });
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A]"
                        value={filters.status}
                        onChange={(e) => {
                          setFilters({ ...filters, status: e.target.value });
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Group
                      </label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A]"
                        value={filters.bloodGroup}
                        onChange={(e) => {
                          setFilters({
                            ...filters,
                            bloodGroup: e.target.value,
                          });
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Blood Groups</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                      <th
                        className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Patient Name
                          {sortConfig?.key === "name" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-4 h-4 ml-2" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-2" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("age")}
                      >
                        <div className="flex items-center">
                          Age/Gender
                          {sortConfig?.key === "age" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-4 h-4 ml-2" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-2" />
                            ))}
                        </div>
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Medical Info
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Status & Visits
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentPatients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-16 text-center">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <User className="w-10 h-10 text-gray-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            No patients found
                          </h3>
                          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                            {searchQuery ||
                            Object.values(filters).some((f) => f)
                              ? "Try adjusting your search or filters"
                              : "No patients registered yet"}
                          </p>
                          <button
                            onClick={() => setShowNewPatientModal(true)}
                            className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-bold rounded-xl hover:shadow-xl transition-all duration-200 shadow-lg"
                          >
                            <UserPlus className="w-5 h-5 mr-3" />
                            Register First Patient
                          </button>
                        </td>
                      </tr>
                    ) : (
                      currentPatients.map((patient) => (
                        <tr
                          key={patient.id}
                          className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300"
                        >
                          {/* Patient Name Column */}
                          <td className="px-8 py-5">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#0A8F7A] to-[#06D6A0] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {getInitials(patient.name)}
                              </div>
                              <div className="ml-4">
                                <div className="text-base font-bold text-gray-900">
                                  {patient.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {patient.id}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Branch: {patient.branch || "Colombo"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Registered:{" "}
                                  {formatDate(patient.registeredDate)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Age/Gender Column */}
                          <td className="px-8 py-5">
                            <div>
                              <div className="text-base font-bold text-gray-900">
                                {patient.age
                                  ? `${patient.age} years`
                                  : "Age not specified"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {patient.gender || "Gender not specified"}
                              </div>
                              {patient.bloodGroup && (
                                <div className="text-sm text-gray-700 mt-1">
                                  <Heart className="w-3 h-3 inline mr-1 text-red-400" />
                                  {patient.bloodGroup}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Contact Info Column */}
                          <td className="px-8 py-5">
                            <div className="text-sm text-gray-900 font-medium flex items-center">
                              <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                              {patient.contact || "No phone"}
                            </div>
                            {patient.email && (
                              <div className="text-sm text-gray-500 font-medium flex items-center mt-2">
                                <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                {patient.email}
                              </div>
                            )}
                            {patient.address && (
                              <div className="text-xs text-gray-500 truncate max-w-xs mt-2 flex items-start">
                                <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                {patient.address}
                              </div>
                            )}
                          </td>

                          {/* Medical Info Column */}
                          <td className="px-8 py-5">
                            <div className="space-y-2">
                              {patient.conditions &&
                                patient.conditions.length > 0 && (
                                  <div>
                                    <div className="text-xs text-gray-500">
                                      Conditions:
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {patient.conditions
                                        .slice(0, 2)
                                        .map((condition, idx) => (
                                          <span
                                            key={idx}
                                            className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-lg"
                                          >
                                            {condition}
                                          </span>
                                        ))}
                                      {patient.conditions.length > 2 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                                          +{patient.conditions.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              {patient.medicalHistory && (
                                <div className="text-xs text-gray-500 truncate">
                                  History:{" "}
                                  {patient.medicalHistory.substring(0, 50)}
                                  {patient.medicalHistory.length > 50 && "..."}
                                </div>
                              )}
                              {patient.insurance && (
                                <div className="mt-2 text-xs text-gray-500 flex items-center">
                                  <Shield className="w-3 h-3 mr-1 text-gray-400" />
                                  Insurance: {patient.insurance}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Status & Visits Column */}
                          <td className="px-8 py-5">
                            <div className="space-y-3">
                              <div>
                                <StatusBadge status={patient.status} />
                              </div>
                              <div className="text-sm text-gray-900 font-bold">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                  Visits: {patient.totalVisits}
                                </div>
                              </div>
                              {patient.lastVisit && (
                                <div className="text-xs text-gray-500">
                                  Last: {formatDate(patient.lastVisit)}
                                </div>
                              )}
                              {patient.nextVisit && (
                                <div className="text-xs text-blue-600 font-medium">
                                  Next: {formatDate(patient.nextVisit)}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="px-8 py-5">
                            <div className="flex flex-col space-y-3">
                              <button
                                onClick={() =>
                                  handleViewPatientDetails(patient)
                                }
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-medium rounded-xl hover:shadow-md transition-all duration-200 border border-blue-200"
                                title="View Full Details"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </button>
                              <button
                                onClick={() =>
                                  handleViewAppointmentHistory(patient)
                                }
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 font-medium rounded-xl hover:shadow-md transition-all duration-200 border border-purple-200"
                                title="Appointment History"
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                Appointments
                              </button>
                              <button
                                onClick={() => handleDeletePatient(patient)}
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-700 font-medium rounded-xl hover:shadow-md transition-all duration-200 border border-red-200"
                                title="Delete Patient"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer - Pagination */}
              {filteredPatients.length > 0 && (
                <div className="px-8 py-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700 font-medium">
                    Showing{" "}
                    <span className="font-bold text-gray-900">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-gray-900">
                      {Math.min(endIndex, filteredPatients.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-900">
                      {filteredPatients.length}
                    </span>{" "}
                    patients
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center space-x-2">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
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
                              className={`w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-all duration-200 ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white shadow-md"
                                  : "border-2 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="px-2 text-gray-400">...</span>
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Patient Profile
                  </h2>
                  <p className="text-gray-600 text-lg mt-2">
                    Complete medical record and information
                  </p>
                </div>
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Patient Header */}
              <div className="bg-gradient-to-r from-[#0A8F7A]/10 to-[#06D6A0]/10 rounded-2xl p-8 mb-8 border border-[#0A8F7A]/20">
                <div className="flex items-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#0A8F7A] to-[#06D6A0] rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                    {getInitials(selectedPatient.name)}
                  </div>
                  <div className="ml-8">
                    <h3 className="text-4xl font-bold text-gray-900">
                      {selectedPatient.name}
                    </h3>
                    <div className="flex items-center space-x-6 mt-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-500 mr-3" />
                        <span className="text-gray-700 font-medium">
                          ID: {selectedPatient.id}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-gray-500 mr-3" />
                        <span className="text-gray-700 font-medium">
                          Branch: {selectedPatient.branch || "Colombo"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                        <span className="text-gray-700 font-medium">
                          {selectedPatient.age
                            ? `${selectedPatient.age} years`
                            : "Age not specified"}
                          , {selectedPatient.gender || "Gender not specified"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <StatusBadge status={selectedPatient.status} />
                      </div>
                    </div>
                    <div className="mt-4 text-gray-600">
                      Registered on {formatDate(selectedPatient.registeredDate)}{" "}
                      • {selectedPatient.totalVisits} total visits
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    {selectedPatient.totalVisits}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">
                    Total Visits
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {
                      patientAppointments.filter(
                        (a) => a.status === "completed",
                      ).length
                    }
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Completed
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <div className="text-3xl font-bold text-purple-700 mb-2">
                    {
                      patientAppointments.filter(
                        (a) =>
                          a.status === "confirmed" || a.status === "pending",
                      ).length
                    }
                  </div>
                  <div className="text-sm text-purple-600 font-medium">
                    Upcoming
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
                  <div className="text-3xl font-bold text-amber-700 mb-2">
                    {
                      patientAppointments.filter(
                        (a) =>
                          a.status === "cancelled" || a.status === "no-show",
                      ).length
                    }
                  </div>
                  <div className="text-sm text-amber-600 font-medium">
                    Cancelled/No-show
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <User className="w-6 h-6 mr-3 text-blue-600" />
                    Personal Information
                  </h4>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-2">
                          Age
                        </label>
                        <p className="text-lg font-medium text-gray-900">
                          {selectedPatient.age || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-2">
                          Gender
                        </label>
                        <p className="text-lg font-medium text-gray-900">
                          {selectedPatient.gender || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">
                        Blood Group
                      </label>
                      <div className="flex items-center">
                        <Heart className="w-5 h-5 text-red-500 mr-3" />
                        <p className="text-lg font-medium text-gray-900">
                          {selectedPatient.bloodGroup || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">
                        Branch
                      </label>
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-blue-500 mr-3" />
                        <p className="text-lg font-medium text-gray-900">
                          {selectedPatient.branch || "Colombo"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">
                        Medical History
                      </label>
                      {selectedPatient.medicalHistory ? (
                        <p className="text-gray-900">
                          {selectedPatient.medicalHistory}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">
                          No medical history recorded
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">
                        Conditions
                      </label>
                      {selectedPatient.conditions &&
                      selectedPatient.conditions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.conditions.map((condition, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-medium"
                            >
                              {condition}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          No conditions recorded
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Phone className="w-6 h-6 mr-3 text-green-600" />
                    Contact Information
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">
                        Phone Number
                      </label>
                      <p className="text-lg font-medium text-gray-900 flex items-center">
                        <Phone className="w-5 h-5 mr-3 text-gray-400" />
                        {selectedPatient.contact || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">
                        Email Address
                      </label>
                      <p className="text-lg font-medium text-gray-900 flex items-center">
                        <Mail className="w-5 h-5 mr-3 text-gray-400" />
                        {selectedPatient.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">
                        Address
                      </label>
                      <p className="text-gray-900 flex items-start">
                        <MapPin className="w-5 h-5 mr-3 text-gray-400 mt-1 flex-shrink-0" />
                        {selectedPatient.address || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">
                        Emergency Contact
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {selectedPatient.emergencyContact || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-purple-600" />
                    Insurance Information
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">
                        Insurance Provider
                      </label>
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 mr-3 text-purple-500" />
                        <p className="text-lg font-medium text-gray-900">
                          {selectedPatient.insurance || "No insurance"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visit Information */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Activity className="w-6 h-6 mr-3 text-purple-600" />
                    Visit Information
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">
                        Last Visit
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {selectedPatient.lastVisit
                          ? formatDate(selectedPatient.lastVisit)
                          : "Never visited"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">
                        Next Scheduled Visit
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {selectedPatient.nextVisit
                          ? formatDate(selectedPatient.nextVisit)
                          : "No upcoming visits"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">
                        Total Visits
                      </label>
                      <p className="text-3xl font-bold text-gray-900">
                        {selectedPatient.totalVisits}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="mb-10">
                <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                  Recent Appointments ({patientAppointments.length})
                </h4>
                {patientAppointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Date & Time
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Doctor
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Reason
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Token
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientAppointments.slice(0, 5).map((appt) => (
                          <tr
                            key={appt.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">
                                {formatDate(appt.date)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appt.time}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">
                                {appt.doctorName || "Unknown Doctor"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-900">{appt.reason}</div>
                            </td>
                            <td className="px-6 py-4">
                              <AppointmentStatusBadge status={appt.status} />
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-gray-900">
                                {appt.token}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {patientAppointments.length > 5 && (
                      <div className="text-center py-4">
                        <button
                          onClick={() => {
                            setShowPatientModal(false);
                            handleViewAppointmentHistory(selectedPatient);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View all {patientAppointments.length} appointments →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No Appointment History
                    </h3>
                    <p className="text-gray-600 mb-6">
                      This patient has no previous appointments.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                <div className="text-gray-600">
                  Patient ID:{" "}
                  <span className="font-bold text-gray-900">
                    {selectedPatient.id}
                  </span>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowPatientModal(false)}
                    className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowPatientModal(false);
                      handleViewAppointmentHistory(selectedPatient);
                    }}
                    className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-200 shadow-lg"
                  >
                    View Full History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment History Modal */}
      {showAppointmentHistoryModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Appointment History
                  </h2>
                  <p className="text-gray-600 text-lg mt-2">
                    Complete appointment records for {selectedPatient.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowAppointmentHistoryModal(false)}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Patient Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 mb-10 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#0A8F7A] to-[#06D6A0] rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                      {getInitials(selectedPatient.name)}
                    </div>
                    <div className="ml-6">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {selectedPatient.name}
                      </h3>
                      <p className="text-gray-600 mt-2">
                        ID: {selectedPatient.id} • {patientAppointments.length}{" "}
                        Appointments • {selectedPatient.totalVisits} Total
                        Visits
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button className="px-6 py-3.5 border-2 border-blue-600 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all duration-200">
                      Print Report
                    </button>
                    <button className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-200 shadow-lg">
                      Schedule New
                    </button>
                  </div>
                </div>
              </div>

              {/* Appointments Table */}
              {patientAppointments.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
                  <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    No Appointment History
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                    This patient has no previous appointments. Schedule their
                    first appointment now.
                  </p>
                  <button className="px-8 py-4 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-200 shadow-lg text-lg">
                    Schedule First Appointment
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 mb-8">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                          <th className="px-8 py-5 text-left text-base font-semibold text-gray-700">
                            Date & Time
                          </th>
                          <th className="px-8 py-5 text-left text-base font-semibold text-gray-700">
                            Doctor
                          </th>
                          <th className="px-8 py-5 text-left text-base font-semibold text-gray-700">
                            Reason & Symptoms
                          </th>
                          <th className="px-8 py-5 text-left text-base font-semibold text-gray-700">
                            Type & Duration
                          </th>
                          <th className="px-8 py-5 text-left text-base font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="px-8 py-5 text-left text-base font-semibold text-gray-700">
                            Token
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {patientAppointments.map((appointment) => (
                          <tr
                            key={appointment.id}
                            className="hover:bg-gray-50 transition-all duration-200"
                          >
                            <td className="px-8 py-5">
                              <div className="text-base font-bold text-gray-900">
                                {formatDate(appointment.date)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.time}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Booked: {formatDate(appointment.bookedAt)}
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="text-base font-bold text-gray-900">
                                {appointment.doctorName || "Unknown Doctor"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Dr. ID: {appointment.doctorId}
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="text-base font-medium text-gray-900">
                                {appointment.reason}
                              </div>
                              {appointment.symptoms &&
                                appointment.symptoms.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-500 mb-1">
                                      Symptoms:
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {appointment.symptoms
                                        .slice(0, 3)
                                        .map((symptom, idx) => (
                                          <span
                                            key={idx}
                                            className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-lg"
                                          >
                                            {symptom}
                                          </span>
                                        ))}
                                      {appointment.symptoms.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                                          +{appointment.symptoms.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                            </td>
                            <td className="px-8 py-5">
                              <div className="text-base font-medium text-gray-900">
                                {appointment.type || "General"}
                              </div>
                              <div className="text-sm text-gray-600">
                                {appointment.duration || "30 mins"}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Priority: {appointment.priority || "Medium"}
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <AppointmentStatusBadge
                                status={appointment.status}
                              />
                              <div className="text-xs text-gray-500 mt-2">
                                Booked by: {appointment.bookedBy || "Staff"}
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="text-base font-mono font-bold text-gray-900">
                                {appointment.token}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {appointment.previousVisits || 0} previous
                                visits
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                      <div className="text-4xl font-bold text-blue-700 mb-2">
                        {patientAppointments.length}
                      </div>
                      <div className="text-sm font-medium text-blue-600">
                        Total Appointments
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                      <div className="text-4xl font-bold text-green-700 mb-2">
                        {
                          patientAppointments.filter(
                            (a) => a.status === "completed",
                          ).length
                        }
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        Completed
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                      <div className="text-4xl font-bold text-purple-700 mb-2">
                        {
                          patientAppointments.filter(
                            (a) =>
                              a.status === "confirmed" ||
                              a.status === "pending",
                          ).length
                        }
                      </div>
                      <div className="text-sm font-medium text-purple-600">
                        Upcoming
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
                      <div className="text-4xl font-bold text-amber-700 mb-2">
                        {
                          patientAppointments.filter(
                            (a) =>
                              a.status === "cancelled" ||
                              a.status === "no-show",
                          ).length
                        }
                      </div>
                      <div className="text-sm font-medium text-amber-600">
                        Cancelled/No-show
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Modal Footer */}
              <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                <div className="text-gray-600">
                  Showing {patientAppointments.length} appointments for{" "}
                  {selectedPatient.name}
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowAppointmentHistoryModal(false)}
                    className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowAppointmentHistoryModal(false);
                      setShowPatientModal(true);
                    }}
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-200 shadow-lg"
                  >
                    Back to Patient Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Patient Registration Modal */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Register New Patient
                  </h2>
                  <p className="text-gray-600 text-lg mt-2">
                    Create a new patient record in the system
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowNewPatientModal(false);
                    resetNewPatientForm();
                  }}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Registration Form */}
              <div className="space-y-8">
                {/* Personal Information Section */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl p-8 border border-blue-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <User className="w-6 h-6 mr-3 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        placeholder="Enter patient's full name"
                        value={newPatient.name}
                        onChange={(e) =>
                          setNewPatient({ ...newPatient, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Age
                      </label>
                      <input
                        type="number"
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        placeholder="Age in years"
                        value={newPatient.age}
                        onChange={(e) =>
                          setNewPatient({ ...newPatient, age: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Gender
                      </label>
                      <select
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        value={newPatient.gender}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            gender: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Blood Group
                      </label>
                      <select
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        value={newPatient.bloodGroup}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            bloodGroup: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Branch
                      </label>
                      <select
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        value={newPatient.branch}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            branch: e.target.value,
                          })
                        }
                      >
                        <option value="Colombo">Colombo</option>
                        <option value="Kandy">Kandy</option>
                        <option value="Galle">Galle</option>
                        <option value="Jaffna">Jaffna</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-2xl p-8 border border-green-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Phone className="w-6 h-6 mr-3 text-green-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        placeholder="+94 77 123 4567"
                        value={newPatient.contact}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            contact: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        placeholder="patient@email.com"
                        value={newPatient.email}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Address
                      </label>
                      <textarea
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        rows={2}
                        placeholder="Full residential address"
                        value={newPatient.address}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        placeholder="Emergency contact number"
                        value={newPatient.emergencyContact}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            emergencyContact: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information Section */}
                <div className="bg-gradient-to-r from-red-50 to-red-100/50 rounded-2xl p-8 border border-red-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Activity className="w-6 h-6 mr-3 text-red-600" />
                    Medical Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Medical History
                      </label>
                      <textarea
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        rows={3}
                        placeholder="Describe patient's medical history (e.g., Hypertension, Diabetes)"
                        value={newPatient.medicalHistory}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            medicalHistory: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Medical Conditions
                      </label>
                      <input
                        type="text"
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        placeholder="e.g., Hypertension, Diabetes, Asthma"
                        value={newPatient.conditions}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            conditions: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Separate multiple conditions with commas
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Allergies
                      </label>
                      <input
                        type="text"
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        placeholder="e.g., Penicillin, Peanuts, Pollen"
                        value={newPatient.allergies}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            allergies: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Separate multiple allergies with commas
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Insurance Provider
                      </label>
                      <input
                        type="text"
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        placeholder="Insurance company name"
                        value={newPatient.insurance}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            insurance: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Patient Status
                      </label>
                      <select
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-[#0A8F7A] text-base"
                        value={newPatient.status}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            status: e.target.value as PatientStatus,
                          })
                        }
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Form Footer */}
                <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                  <div className="text-gray-600">* Required fields</div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setShowNewPatientModal(false);
                        resetNewPatientForm();
                      }}
                      className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNewPatient}
                      className="px-8 py-3.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-200 shadow-lg"
                    >
                      <UserPlus className="w-5 h-5 mr-2 inline" />
                      Register Patient
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full">
            <div className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                  <Trash2 className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Delete Patient Record
                </h2>
                <p className="text-gray-600">
                  Are you sure you want to permanently delete this patient
                  record? This action cannot be undone.
                </p>
              </div>

              {/* Patient Info Card */}
              <div className="bg-red-50 rounded-2xl p-6 mb-8 border border-red-200">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0A8F7A] to-[#06D6A0] rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    {getInitials(selectedPatient.name)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-red-800">
                      {selectedPatient.name}
                    </h3>
                    <div className="text-sm text-red-700 space-y-1 mt-2">
                      <div>ID: {selectedPatient.id}</div>
                      <div>
                        {selectedPatient.age
                          ? `${selectedPatient.age} years`
                          : "Age not specified"}
                        , {selectedPatient.gender || "Gender not specified"}
                      </div>
                      <div>
                        Phone: {selectedPatient.contact || "Not provided"}
                      </div>
                      <div>Branch: {selectedPatient.branch || "Colombo"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-amber-50 rounded-2xl p-5 mb-8 border border-amber-200">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800 mb-1">
                      Important Warning
                    </h4>
                    <p className="text-amber-700 text-sm">
                      This will delete all patient data including appointment
                      history, medical records, and billing information. The
                      patient will no longer be accessible in the system.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-200 shadow-lg"
                >
                  <Trash2 className="w-5 h-5 mr-2 inline" />
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
