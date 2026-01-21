"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../../components/PatientSidebar";
import {
  Bell,
  Search,
  Plus,
  FileText,
  CreditCard,
  Calendar,
  MapPin,
  MessageSquare,
  ChevronRight,
  Phone,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Package,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/app/firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import BookAppointmentModal from "../../../components/BookingModal";
import EditAppointmentModal from "../../../components/EditAppointmentModal";

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
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  email: string;
  address: string;
  medicalHistory: string;
  bloodGroup: string;
  insurance: string;
  emergencyContact: string;
  branch: string;
  createdAt: string;
}

interface WellnessPackage {
  id: string;
  name: string;
  description: string;
  sessions: number;
  pricePerSession: number;
  totalPrice: number;
  membershipDiscounts: number;
  duration: string;
  includes: string[];
  createdAt: string;
}

interface BillingRecord {
  id: string;
  patientId: string;
  appointmentId: string;
  patientName: string;
  services: Array<{ name: string; amount: number }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "paid" | "pending" | "partial";
  paymentMethod: string;
  paidAt?: string;
  createdBy: string;
  createdAt: string;
  amountPaid?: number;
  balanceDue?: number;
}

interface User {
  id: string;
  name: string;
  role: string;
  specialization?: string;
  branch?: string;
  email: string;
  phone: string;
}

export default function PatientDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Patient data
  const [patient, setPatient] = useState<Patient | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [wellnessPackages, setWellnessPackages] = useState<WellnessPackage[]>(
    [],
  );
  const [pendingBills, setPendingBills] = useState<BillingRecord[]>([]);

  // Statistics
  const [stats, setStats] = useState({
    totalAppointments: 0,
    activePackages: 0,
    pendingAmount: 0,
    unreadMessages: 0,
  });

  // Modal states
  const [showBookModal, setShowBookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  // Get patient ID from localStorage or auth context
  const patientId = "PAT-001";

  // Fetch all patient data
  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch patient details
      const patientDoc = await getDoc(doc(db, "patients", patientId));
      if (patientDoc.exists()) {
        const patientData = patientDoc.data();
        setPatient({
          id: patientDoc.id,
          ...patientData,
          contact: patientData.contact || "",
        } as Patient);
      } else {
        throw new Error("Patient not found");
      }

      // 2. Fetch appointments - using simpler query without date filter
      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("patientId", "==", patientId),
        // Note: Removed date filter and orderBy to avoid composite index
      );

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const allAppointments = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];

      // Get today's date
      const today = new Date().toISOString().split("T")[0];

      // Filter and sort appointments client-side
      const upcomingAppointmentsData = allAppointments
        .filter((appointment) => {
          // Keep appointments from today onwards
          return appointment.date >= today;
        })
        .sort((a, b) => {
          // Sort by date and time
          if (a.date === b.date) {
            return a.time.localeCompare(b.time);
          }
          return a.date.localeCompare(b.date);
        })
        .slice(0, 5); // Get first 5

      // 3. Fetch doctor details for each appointment
      const doctorIds = [
        ...new Set(upcomingAppointmentsData.map((a) => a.doctorId)),
      ];
      const doctorsMap = new Map();

      // Fetch all doctors in parallel
      const doctorPromises = doctorIds.map(async (doctorId) => {
        try {
          const doctorDoc = await getDoc(doc(db, "users", doctorId));
          if (doctorDoc.exists()) {
            const doctorData = doctorDoc.data() as User;
            doctorsMap.set(doctorId, {
              name: doctorData.name,
              specialization:
                doctorData.specialization || "General Practitioner",
              email: doctorData.email,
              phone: doctorData.phone,
              branch: doctorData.branch || "Colombo",
            });
          }
        } catch (error) {
          console.error(`Error fetching doctor ${doctorId}:`, error);
        }
      });

      await Promise.all(doctorPromises);

      // Enrich appointments with doctor data
      const enrichedAppointments = upcomingAppointmentsData.map(
        (appointment) => ({
          ...appointment,
          doctorName: doctorsMap.get(appointment.doctorId)?.name || "Doctor",
          doctorSpecialization:
            doctorsMap.get(appointment.doctorId)?.specialization ||
            "General Practitioner",
          doctorEmail: doctorsMap.get(appointment.doctorId)?.email,
          doctorPhone: doctorsMap.get(appointment.doctorId)?.phone,
          branch: doctorsMap.get(appointment.doctorId)?.branch || "Colombo",
        }),
      );

      setUpcomingAppointments(enrichedAppointments);

      // 4. Fetch wellness packages - no filtering needed
      const packagesSnapshot = await getDocs(
        collection(db, "wellnessPackages"),
      );
      const packagesData = packagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WellnessPackage[];

      setWellnessPackages(packagesData);

      // 5. Fetch billing records - simpler query without status filter
      const billsQuery = query(
        collection(db, "billing"),
        where("patientId", "==", patientId),
      );

      const billsSnapshot = await getDocs(billsQuery);
      const allBills = billsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BillingRecord[];

      // Filter client-side for pending/partial bills
      const pendingBillsData = allBills.filter(
        (bill) => bill.status === "pending" || bill.status === "partial",
      );

      setPendingBills(pendingBillsData);

      // 6. Calculate statistics
      const totalAppointments = enrichedAppointments.length;
      const activePackages = packagesData.length;
      const pendingAmount = pendingBillsData.reduce((sum, bill) => {
        if (bill.status === "partial") {
          return sum + (bill.balanceDue || bill.total - (bill.amountPaid || 0));
        }
        return sum + bill.total;
      }, 0);
      const unreadMessages = 2; // Hardcoded for now

      setStats({
        totalAppointments,
        activePackages,
        pendingAmount,
        unreadMessages,
      });
    } catch (err: any) {
      console.error("Error fetching patient data:", err);

      // Check if it's an index error
      if (
        err.message?.includes("index") ||
        err.code === "failed-precondition"
      ) {
        // Try alternative approach with single field queries
        await fetchDataWithSimpleQueries();
      } else {
        setError(err.message || "Failed to load patient data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Alternative fetch method using simpler queries
  const fetchDataWithSimpleQueries = async () => {
    try {
      // 1. Fetch patient
      const patientDoc = await getDoc(doc(db, "patients", patientId));
      if (patientDoc.exists()) {
        const patientData = patientDoc.data();
        setPatient({
          id: patientDoc.id,
          ...patientData,
          contact: patientData.contact || "",
        } as Patient);
      }

      // 2. Fetch appointments using getDocs without query constraints initially
      // This is less efficient but avoids index requirements
      const appointmentsSnapshot = await getDocs(
        collection(db, "appointments"),
      );
      const allAppointments = appointmentsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Appointment)
        .filter((appointment) => appointment.patientId === patientId);

      // Get today's date
      const today = new Date().toISOString().split("T")[0];

      // Filter for upcoming appointments
      const upcomingAppointmentsData = allAppointments
        .filter((appointment) => appointment.date >= today)
        .sort((a, b) => {
          if (a.date === b.date) {
            return a.time.localeCompare(b.time);
          }
          return a.date.localeCompare(b.date);
        })
        .slice(0, 5);

      // Fetch doctor data
      const doctorPromises = upcomingAppointmentsData.map(
        async (appointment) => {
          try {
            const doctorDoc = await getDoc(
              doc(db, "users", appointment.doctorId),
            );
            if (doctorDoc.exists()) {
              const doctorData = doctorDoc.data() as User;
              return {
                ...appointment,
                doctorName: doctorData.name,
                doctorSpecialization:
                  doctorData.specialization || "General Practitioner",
                doctorPhone: doctorData.phone,
                branch: doctorData.branch || "Colombo",
              };
            }
            return appointment;
          } catch (error) {
            console.error("Error fetching doctor:", error);
            return appointment;
          }
        },
      );

      const enrichedAppointments = await Promise.all(doctorPromises);
      setUpcomingAppointments(enrichedAppointments);

      // 3. Fetch wellness packages
      const packagesSnapshot = await getDocs(
        collection(db, "wellnessPackages"),
      );
      const packagesData = packagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WellnessPackage[];
      setWellnessPackages(packagesData);

      // 4. Fetch billing records
      const billsSnapshot = await getDocs(collection(db, "billing"));
      const allBills = billsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as BillingRecord)
        .filter(
          (bill) =>
            bill.patientId === patientId &&
            (bill.status === "pending" || bill.status === "partial"),
        );

      setPendingBills(allBills);

      // 5. Calculate stats
      setStats({
        totalAppointments: enrichedAppointments.length,
        activePackages: packagesData.length,
        pendingAmount: allBills.reduce((sum, bill) => {
          if (bill.status === "partial") {
            return (
              sum + (bill.balanceDue || bill.total - (bill.amountPaid || 0))
            );
          }
          return sum + bill.total;
        }, 0),
        unreadMessages: 2,
      });
    } catch (err: any) {
      console.error("Error in alternative fetch:", err);
      setError(
        err.message ||
          "Failed to load data. Please check Firebase configuration.",
      );
    }
  };

  // Handle book new appointment
  const handleBookAppointment = () => {
    setShowBookModal(true);
  };

  // Handle reschedule appointment
  const handleRescheduleAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowEditModal(true);
  };

  // Handle appointment booked (from BookAppointmentModal)
  const handleAppointmentBooked = () => {
    setShowBookModal(false);
    fetchPatientData();
    alert("Appointment booked successfully!");
  };

  // Handle save edited appointment (from EditAppointmentModal)
  const handleSaveEdit = () => {
    setShowEditModal(false);
    setEditingAppointment(null);
    fetchPatientData();
    alert("Appointment rescheduled successfully!");
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingAppointment(null);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (
    status: AppointmentStatus | "paid" | "pending" | "partial",
  ) => {
    switch (status) {
      case "confirmed":
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "partial":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
        <div className="lg:ml-64 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A8F7A] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
        <div className="lg:ml-64 p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="font-medium text-red-800">
                  Error Loading Dashboard
                </h3>
                <p className="text-red-600 mt-1">{error}</p>
                {error.includes("index") && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-red-600">
                      The query requires a composite index. You can:
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={fetchPatientData}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Retry
                      </button>
                      <button
                        onClick={fetchDataWithSimpleQueries}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Try Alternative Load
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const nextAppointment = upcomingAppointments[0];
  const activePackage = wellnessPackages[0] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 lg:ml-64">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="text-black absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search appointments, records, or doctors..."
                  className="text-black w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F7A]/20 focus:border-[#0A8F7A] transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 ml-6">
              {/* Notifications */}
              <div className="relative">
                <button
                  title="Notify"
                  className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <Bell className="h-5 w-5 text-gray-600 group-hover:text-[#0A8F7A]" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] flex items-center justify-center">
                  <span className="text-white font-bold">
                    {patient?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "P"}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="font-medium text-gray-900">
                    {patient?.name || "Patient"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Patient ID: {patientId}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {patient?.name?.split(" ")[0] || "Patient"}!
                </h1>
                <p className="text-gray-600">
                  Here's what's happening with your health today
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-sm font-medium rounded-full">
                  Member since{" "}
                  {patient?.createdAt
                    ? new Date(patient.createdAt).getFullYear()
                    : "2022"}
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 text-sm font-medium rounded-full">
                  {patient?.insurance || "No Insurance"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Upcoming Appointments Stat */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.totalAppointments}
                  </div>
                  <div className="text-xs text-gray-500">
                    {upcomingAppointments.length > 0
                      ? "Next: Today"
                      : "No appointments"}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                Upcoming Appointments
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                  style={{
                    width: `${Math.min((stats.totalAppointments / 10) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Active Packages Stat */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.activePackages}
                  </div>
                  <div className="text-xs text-gray-500">
                    Available packages
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                Wellness Packages
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                  style={{
                    width: `${Math.min((stats.activePackages / 5) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Pending Bills Stat */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.pendingAmount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {pendingBills.length} pending bill
                    {pendingBills.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                Pending Bills
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  style={{
                    width: `${Math.min((pendingBills.length / 5) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Unread Messages Stat */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.unreadMessages}
                  </div>
                  <div className="text-xs text-gray-500">
                    From medical staff
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                Unread Messages
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{
                    width: `${Math.min((stats.unreadMessages / 10) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Upcoming Appointments Widget */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Upcoming Appointments
                  </h2>
                  <Link
                    href="/patient/appointments"
                    className="text-sm text-[#0A8F7A] hover:text-[#0A8F7A]/80 font-medium flex items-center"
                  >
                    View all
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      No upcoming appointments
                    </p>
                    <button
                      onClick={handleBookAppointment}
                      className="px-4 py-2 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-lg hover:shadow-md transition-shadow"
                    >
                      Book Your First Appointment
                    </button>
                  </div>
                ) : (
                  <>
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 rounded-xl border border-gray-100 hover:border-[#0A8F7A]/30 hover:shadow-sm transition-all duration-200 group mb-4 last:mb-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                              <span className="font-bold text-blue-700">
                                {appointment.doctorName
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("") || "DR"}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {appointment.doctorName || "Doctor"}
                              </div>
                              <div className="text-sm text-gray-600">
                                {appointment.doctorSpecialization ||
                                  "General Practitioner"}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {appointment.branch || "Colombo"}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                            >
                              {appointment.status.charAt(0).toUpperCase() +
                                appointment.status.slice(1)}
                            </span>
                            <div className="text-sm text-gray-900 font-medium mt-2">
                              {formatDate(appointment.date)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {appointment.time}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-gray-600">Token:</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {appointment.token}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            {appointment.status === "confirmed" && (
                              <button
                                onClick={() =>
                                  handleRescheduleAppointment(appointment)
                                }
                                className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-lg hover:shadow-md transition-shadow"
                              >
                                Reschedule
                              </button>
                            )}
                            {appointment.doctorPhone && (
                              <button className="text-black px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <Phone className="h-3 w-3 inline mr-1" />
                                Call
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={handleBookAppointment}
                      className="mt-6 w-full py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-200 group"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Book New Appointment
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Active Wellness Packages Widget */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Wellness Packages
                  </h2>
                  <Link
                    href="/patient/wellness"
                    className="text-sm text-[#0A8F7A] hover:text-[#0A8F7A]/80 font-medium flex items-center"
                  >
                    View all
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {wellnessPackages.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      No wellness packages available
                    </p>
                    <Link
                      href="/patient/wellness/browse"
                      className="px-4 py-2 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-lg hover:shadow-md transition-shadow inline-block"
                    >
                      Browse Packages
                    </Link>
                  </div>
                ) : (
                  <>
                    {wellnessPackages.slice(0, 2).map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-4 rounded-xl border border-gray-100 hover:border-[#0A8F7A]/30 hover:shadow-sm transition-all duration-200 mb-4 last:mb-0"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-bold text-gray-900">
                              {pkg.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {pkg.description}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              Duration
                            </div>
                            <div className="font-medium text-gray-900">
                              {pkg.duration}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">
                              Total Sessions
                            </span>
                            <span className="font-medium text-gray-900">
                              {pkg.sessions} sessions
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                              style={{ width: "0%" }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="text-sm">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {formatCurrency(pkg.totalPrice)}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/patient/wellness/${pkg.id}`}
                              className="text-black px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              View Details
                            </Link>
                            <button className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-lg hover:shadow-md transition-shadow">
                              Purchase
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Link
                      href="/patient/wellness/browse"
                      className="mt-6 w-full py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-200 group"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Explore More Packages
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Recent Notifications Widget */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Notifications & Alerts
                </h2>
                <Link
                  href="/patient/notifications"
                  className="text-sm text-[#0A8F7A] hover:text-[#0A8F7A]/80 font-medium flex items-center"
                >
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            <div className="p-6">
              {/* Appointment notifications */}
              {nextAppointment && (
                <div className="p-4 rounded-xl border border-[#0A8F7A]/20 bg-gradient-to-r from-[#D6F4ED]/20 to-[#C0F0E5]/20 hover:shadow-sm transition-all duration-200 group mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-100">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            Appointment Reminder
                            <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                          </div>
                          <p className="text-gray-600 mt-1">
                            Your appointment with {nextAppointment.doctorName}{" "}
                            is coming up
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 whitespace-nowrap ml-4">
                          {formatDate(nextAppointment.date)} at{" "}
                          {nextAppointment.time}
                        </div>
                      </div>

                      <div className="mt-3 flex space-x-2">
                        <button className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-lg hover:shadow-md transition-shadow">
                          View Details
                        </button>
                        <button
                          onClick={() =>
                            handleRescheduleAppointment(nextAppointment)
                          }
                          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bill notifications */}
              {pendingBills.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/50 hover:shadow-sm transition-all duration-200 group">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-amber-100 to-orange-100">
                      <CreditCard className="h-5 w-5 text-amber-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            Billing Alert
                            <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                          </div>
                          <p className="text-gray-600 mt-1">
                            You have {pendingBills.length} pending bill
                            {pendingBills.length !== 1 ? "s" : ""} totaling{" "}
                            {formatCurrency(stats.pendingAmount)}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 whitespace-nowrap ml-4">
                          Due soon
                        </div>
                      </div>

                      <div className="mt-3 flex space-x-2">
                        <Link
                          href="/patient/billing"
                          className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-lg hover:shadow-md transition-shadow"
                        >
                          Pay Now
                        </Link>
                        <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Package notifications */}
              {activePackage && (
                <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-green-50/50 hover:shadow-sm transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-emerald-100 to-green-100">
                        <Package className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Wellness Packages Available
                        </div>
                        <p className="text-sm text-gray-600">
                          Explore our new wellness packages for better health
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/patient/wellness/browse"
                      className="text-sm text-[#0A8F7A] hover:text-[#0A8F7A]/80 font-medium"
                    >
                      Browse →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showBookModal && (
        <BookAppointmentModal
          isOpen={showBookModal}
          onClose={() => setShowBookModal(false)}
          onAppointmentBooked={handleAppointmentBooked}
          patientId={patientId}
          patientName={patient?.name || ""}
        />
      )}

      {showEditModal && editingAppointment && (
        <EditAppointmentModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleSaveEdit}
          appointment={editingAppointment}
        />
      )}
    </div>
  );
}
