"use client";

import { useState, useEffect } from "react";
import DoctorSidebar from "../../../components/DoctorSidebar";
import { db } from "@/app/firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  User,
  Phone,
  Calendar,
  Mail,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  AlertCircle,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  contact?: string;
  email?: string;
  address?: string;
  medicalHistory?: string;
  conditions?: string[];
  allergies?: string[];
  lastVisit?: string;
  nextVisit?: string;
  totalVisits: number;
  status: "Active" | "Inactive";
  bloodGroup?: string;
  insurance?: string;
  emergencyContact?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  date: string;
  status: string;
  reason: string;
}

export default function DoctorPatients() {
  const doctorId = "DR-001";
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    gender: "",
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Patient;
    direction: "asc" | "desc";
  } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchPatientsData = async () => {
      setLoading(true);
      try {
        // 1️⃣ Fetch all appointments for this doctor
        const apptQuery = query(
          collection(db, "appointments"),
          where("doctorId", "==", doctorId),
        );
        const apptSnapshot = await getDocs(apptQuery);
        const appointmentsData = apptSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Appointment[];
        setAppointments(appointmentsData);

        // 2️⃣ Get unique patient IDs from appointments
        const patientIds = Array.from(
          new Set(
            appointmentsData.map((appt) => appt.patientId).filter(Boolean),
          ),
        );

        // 3️⃣ Fetch patient details from patients collection
        const patientsData: Patient[] = [];

        for (const patientId of patientIds) {
          try {
            const patientDocRef = doc(db, "patients", patientId);
            const patientDoc = await getDoc(patientDocRef);

            if (patientDoc.exists()) {
              const patientData = patientDoc.data();

              // Get appointments for this specific patient
              const patientAppointments = appointmentsData.filter(
                (appt) => appt.patientId === patientId,
              );

              // Calculate last and next visits
              const sortedDates = patientAppointments
                .map((a) => new Date(a.date))
                .sort((a, b) => a.getTime() - b.getTime());

              const pastVisits = sortedDates.filter((d) => d <= new Date());
              const futureVisits = sortedDates.filter((d) => d > new Date());

              const lastVisit =
                pastVisits.length > 0
                  ? pastVisits[pastVisits.length - 1].toISOString()
                  : undefined;

              const nextVisit =
                futureVisits.length > 0
                  ? futureVisits[0].toISOString()
                  : undefined;

              // Parse medical history for conditions
              const conditions = patientData.medicalHistory
                ? patientData.medicalHistory
                    .split(",")
                    .map((c: string) => c.trim())
                : [];

              patientsData.push({
                id: patientId,
                name: patientData.name || "Unknown Patient",
                age:
                  patientData.age ||
                  parseInt(patientData.dob?.split("-")[0]) ||
                  undefined,
                gender: patientData.gender,
                contact: patientData.contact || patientData.phone,
                email: patientData.email,
                address: patientData.address,
                medicalHistory: patientData.medicalHistory,
                conditions: conditions,
                allergies: patientData.allergies || [],
                lastVisit,
                nextVisit,
                totalVisits: patientAppointments.length,
                status: patientAppointments.some(
                  (a) => a.status === "confirmed",
                )
                  ? "Active"
                  : "Inactive",
                bloodGroup: patientData.bloodGroup,
                insurance: patientData.insurance,
                emergencyContact: patientData.emergencyContact,
              });
            }
          } catch (error) {
            console.error(`Error fetching patient ${patientId}:`, error);
          }
        }

        setPatients(patientsData);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientsData();
  }, [doctorId]);

  // Helper functions
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return undefined;
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    } catch {
      return undefined;
    }
  };

  // Filter, sort, and paginate
  const filteredPatients = patients
    .filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesContact = p.contact?.toLowerCase().includes(q) || false;
        const matchesEmail = p.email?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesContact && !matchesEmail) return false;
      }
      if (filters.status && p.status !== filters.status) return false;
      if (filters.gender && p.gender !== filters.gender) return false;
      return true;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      let aVal = a[key];
      let bVal = b[key];

      if (aVal === undefined || aVal === null) aVal = "";
      if (bVal === undefined || bVal === null) bVal = "";

      if (key === "lastVisit" || key === "nextVisit") {
        const aDate = aVal ? new Date(aVal as string).getTime() : 0;
        const bDate = bVal ? new Date(bVal as string).getTime() : 0;
        return direction === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (key === "totalVisits" || key === "age") {
        const aNum = Number(aVal) || 0;
        const bNum = Number(bVal) || 0;
        return direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / itemsPerPage),
  );
  const currentPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSort = (key: keyof Patient) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({ status: "", gender: "" });
    setSortConfig(null);
    setCurrentPage(1);
  };

  const totalPatients = patients.length;
  const activePatients = patients.filter((p) => p.status === "Active").length;
  const newPatientsThisMonth = patients.filter(
    (p) => p.totalVisits === 1,
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <DoctorSidebar doctorName="Loading..." doctorSpecialization="" />
        <main className="lg:ml-64 flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A8F7A] mb-4"></div>
            <p className="text-gray-700">Loading patients...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorSidebar
        doctorName="Dr. Sarah Johnson"
        doctorSpecialization="Cardiology"
      />

      <main className="lg:ml-64 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Patient Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and view all your patients' information
                </p>
              </div>
              <button className="px-4 py-2 bg-[#0A8F7A] text-white rounded-lg hover:bg-[#098d78] transition-colors">
                Add New Patient
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalPatients}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Active Patients</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activePatients}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">New This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {newPatientsThisMonth}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by name, phone, or email..."
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
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select
                        className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent bg-white"
                        value={filters.status}
                        onChange={(e) => {
                          setFilters({ ...filters, status: e.target.value });
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>

                      <select
                        className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent bg-white"
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
                  </div>
                )}
              </div>
            </div>

            {/* Patients Grid */}
            {currentPatients.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No patients found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || Object.values(filters).some((f) => f)
                    ? "Try adjusting your search or filters"
                    : "No patients registered yet"}
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-[#0A8F7A] text-white rounded-lg hover:bg-[#098d78] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                    >
                      {/* Patient Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#0A8F7A] to-[#098d78] rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {patient.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">
                                {patient.age ? `${patient.age}y` : "Age N/A"} •{" "}
                                {patient.gender || "N/A"}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${
                                  patient.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {patient.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              ID: {patient.id}
                            </p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-4">
                        {patient.contact && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{patient.contact}</span>
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="truncate">{patient.email}</span>
                          </div>
                        )}
                        {patient.address && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="truncate">{patient.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Medical Info */}
                      <div className="mb-4">
                        {patient.conditions &&
                          patient.conditions.length > 0 && (
                            <div className="mb-2">
                              <div className="flex items-center text-sm text-gray-700 mb-1">
                                <Heart className="w-4 h-4 mr-1 text-red-400" />
                                <span className="font-medium">Conditions:</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {patient.conditions
                                  .slice(0, 3)
                                  .map((condition, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded"
                                    >
                                      {condition}
                                    </span>
                                  ))}
                                {patient.conditions.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                    +{patient.conditions.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                        {patient.allergies && patient.allergies.length > 0 && (
                          <div>
                            <div className="flex items-center text-sm text-gray-700 mb-1">
                              <AlertCircle className="w-4 h-4 mr-1 text-amber-400" />
                              <span className="font-medium">Allergies:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {patient.allergies
                                .slice(0, 2)
                                .map((allergy, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded"
                                  >
                                    {allergy}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Visit Info */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-gray-500">Last Visit</p>
                            <p className="font-medium">
                              {formatDate(patient.lastVisit)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Next Visit</p>
                            <p className="font-medium">
                              {formatDate(patient.nextVisit)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500">Total Visits</p>
                            <p className="font-medium">{patient.totalVisits}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                          View Profile
                        </button>
                        <button className="flex-1 px-3 py-2 bg-[#0A8F7A] text-white text-sm rounded-lg hover:bg-[#098d78] transition-colors">
                          Schedule Visit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {filteredPatients.length > itemsPerPage && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm text-gray-700">
                      Showing{" "}
                      {Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        filteredPatients.length,
                      )}{" "}
                      to{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredPatients.length,
                      )}{" "}
                      of {filteredPatients.length} patients
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

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
                              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                                currentPage === pageNum
                                  ? "bg-[#0A8F7A] text-white"
                                  : "border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}

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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
