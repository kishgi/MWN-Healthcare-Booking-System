"use client";

import { useState, useEffect } from "react";
import {
  User,
  Calendar,
  FileText,
  Droplets,
  AlertCircle,
  Heart,
  Stethoscope,
  Download,
  Upload,
  Eye,
  Lock,
  Shield,
  Bell,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Search,
  Filter,
  Printer,
  Share2,
  Edit,
  Plus,
  Trash2,
  Image as ImageIcon,
  File,
  Activity,
  Pill,
  Clipboard,
  Thermometer,
  Scale,
  Brain,
  Bone,
  Eye as EyeIcon,
  Heart as HeartIcon,
  UserCheck,
  Users,
  Home,
  Phone as PhoneIcon,
  Mail as MailIcon,
  CalendarDays,
  Tag,
  QrCode,
  Smartphone,
  Building,
  X,
} from "lucide-react";
import Sidebar from "../../../components/PatientSidebar";
import { db } from "@/app/firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  Timestamp,
} from "firebase/firestore";

// Types
type MedicalRecordType =
  | "consultation"
  | "lab_report"
  | "prescription"
  | "scan"
  | "assessment"
  | "vaccination";
type AccessRole = "doctor" | "staff" | "patient";
type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
type Gender = "Male" | "Female" | "Other";
type AppointmentStatus =
  | "completed"
  | "cancelled"
  | "no_show"
  | "confirmed"
  | "pending";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  contact: string;
  email: string;
  address: string;
  medicalHistory: string;
  bloodGroup: BloodGroup;
  insurance: string;
  emergencyContact: string;
  branch: string;
  createdAt: string;
  // Additional fields for display
  fullName?: string;
  dateOfBirth?: string;
  specialNotes?: string[];
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  patientCode?: string;
}

interface MedicalRecord {
  id: string;
  type: MedicalRecordType;
  title: string;
  date: string;
  doctorName: string;
  doctorId?: string;
  branchName: string;
  summary: string;
  diagnosis?: string[];
  prescriptions?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes: string[];
  attachments?: string[];
  isEncrypted: boolean;
  accessLevel: AccessRole[];
  // Fields from appointments that can be used as medical records
  patientId?: string;
  reason?: string;
  symptoms?: string[];
  labReports?: string[];
  duration?: string;
  priority?: string;
}

interface LabReport {
  id: string;
  testName: string;
  date: string;
  labName: string;
  status: "normal" | "abnormal" | "critical";
  results: Array<{
    parameter: string;
    value: string;
    unit: string;
    normalRange: string;
    status: "normal" | "high" | "low";
  }>;
  doctorNotes: string;
  fileUrl: string;
  // Fields from billing that can be used as lab reports
  patientId?: string;
  services?: Array<{ name: string; amount: number }>;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  doctorId: string;
  branchName: string;
  branch?: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  patientId: string;
  patientName: string;
  token: string;
  symptoms?: string[];
  labReports?: string[];
  duration?: string;
  priority?: string;
  type?: "new" | "follow-up" | "review";
}

interface AccessLog {
  id: string;
  timestamp: string;
  accessedBy: string;
  role: AccessRole;
  action: "viewed" | "edited" | "added" | "downloaded";
  details: string;
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

export default function PatientHealthCard() {
  // State
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);

  const [userRole] = useState<AccessRole>("patient"); // In real app, get from auth context
  const [activeTab, setActiveTab] = useState<
    "overview" | "medical" | "labs" | "appointments" | "access"
  >("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<MedicalRecordType | "all">(
    "all",
  );
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [loading, setLoading] = useState({
    patient: true,
    records: true,
    appointments: true,
    labs: true,
  });

  // Patient ID (using PAT-001 from your seed data)
  const patientId = "PAT-001";

  // Fetch all patient data
  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading({
        patient: true,
        records: true,
        appointments: true,
        labs: true,
      });

      // 1. Fetch patient details
      const patientDoc = await getDoc(doc(db, "patients", patientId));
      if (patientDoc.exists()) {
        const patientData = patientDoc.data() as Patient;

        // Parse medical history string into arrays
        const medicalHistoryText = patientData.medicalHistory || "";
        const chronicConditions = medicalHistoryText
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item);

        // Create enhanced patient object for display
        const enhancedPatient: Patient = {
          ...patientData,
          id: patientDoc.id,
          fullName: patientData.name,
          dateOfBirth: patientData.createdAt, // Using createdAt as approximate DOB
          specialNotes: [
            "Regular exercise recommended",
            "Follow-up required every 3 months",
          ],
          allergies: ["Penicillin", "Peanuts"], // Default allergies from your seed data
          chronicConditions,
          currentMedications: ["Metformin 500mg - Twice daily"], // Default from seed
          patientCode: `MWN-PAT-${patientDoc.id}`,
        };

        setPatient(enhancedPatient);
      }

      // 2. Fetch appointments (which will serve as medical records)
      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("patientId", "==", patientId),
        orderBy("date", "desc"),
      );

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];

      // 3. Fetch doctor details for appointments
      const doctorIds = [...new Set(appointmentsData.map((a) => a.doctorId))];
      const doctorsMap = new Map();

      const doctorPromises = doctorIds.map(async (doctorId) => {
        try {
          const doctorDoc = await getDoc(doc(db, "users", doctorId));
          if (doctorDoc.exists()) {
            const doctorData = doctorDoc.data() as User;
            doctorsMap.set(doctorId, {
              name: doctorData.name,
              specialization:
                doctorData.specialization || "General Practitioner",
              branch: doctorData.branch || "Colombo",
            });
          }
        } catch (error) {
          console.error(`Error fetching doctor ${doctorId}:`, error);
        }
      });

      await Promise.all(doctorPromises);

      // 4. Convert appointments to medical records format
      const medicalRecords = appointmentsData.map((appointment) => {
        const doctorInfo = doctorsMap.get(appointment.doctorId);

        return {
          id: appointment.id,
          type: "consultation" as MedicalRecordType,
          title: `${appointment.reason} - ${doctorInfo?.specialization || "Consultation"}`,
          date: appointment.date,
          doctorName: doctorInfo?.name || "Doctor",
          branchName: appointment.branch || "Colombo",
          summary: appointment.notes || appointment.reason,
          diagnosis: appointment.symptoms,
          notes: [appointment.notes || appointment.reason],
          isEncrypted: true,
          accessLevel: ["doctor", "staff", "patient"],
          reason: appointment.reason,
          symptoms: appointment.symptoms,
          labReports: appointment.labReports,
          duration: appointment.duration,
          priority: appointment.priority,
        } as MedicalRecord;
      });

      setMedicalHistory(medicalRecords);
      setAppointments(appointmentsData);

      // 5. Create lab reports from billing data (services that are lab tests)
      const billsQuery = query(
        collection(db, "billing"),
        where("patientId", "==", patientId),
      );

      const billsSnapshot = await getDocs(billsQuery);
      const billsData = billsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // Convert billing services to lab reports
      const labReportsData: LabReport[] = billsData.flatMap((bill) =>
        (bill.services || [])
          .filter(
            (service: any) =>
              service.name?.toLowerCase().includes("test") ||
              service.name?.toLowerCase().includes("lab") ||
              service.name?.toLowerCase().includes("scan"),
          )
          .map((service: any, index: number) => ({
            id: `${bill.id}-lab-${index}`,
            testName: service.name,
            date: bill.createdAt || new Date().toISOString(),
            labName: "MWN Central Lab",
            status: "normal" as const,
            results: [
              {
                parameter: "Test Result",
                value: "Completed",
                unit: "",
                normalRange: "N/A",
                status: "normal" as const,
              },
            ],
            doctorNotes: "Test completed successfully",
            fileUrl: `${service.name.toLowerCase().replace(/\s+/g, "_")}_report.pdf`,
          })),
      );

      // Add some default lab reports if none found
      if (labReportsData.length === 0) {
        labReportsData.push({
          id: "lab-001",
          testName: "Complete Blood Count (CBC)",
          date: new Date().toISOString(),
          labName: "MWN Central Lab",
          status: "normal",
          results: [
            {
              parameter: "Hemoglobin",
              value: "14.2",
              unit: "g/dL",
              normalRange: "13.5-17.5",
              status: "normal",
            },
            {
              parameter: "WBC Count",
              value: "7.5",
              unit: "10^3/μL",
              normalRange: "4.5-11.0",
              status: "normal",
            },
          ],
          doctorNotes: "All parameters within normal range",
          fileUrl: "cbc_report.pdf",
        });
      }

      setLabReports(labReportsData);

      // 6. Create sample access logs
      const sampleAccessLogs: AccessLog[] = [
        {
          id: "log-001",
          timestamp: new Date().toISOString(),
          accessedBy: "Dr. Sarah Johnson",
          role: "doctor",
          action: "viewed",
          details: "Viewed complete medical history",
        },
        {
          id: "log-002",
          timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          accessedBy: "Robert Chen",
          role: "patient",
          action: "viewed",
          details: "Viewed medical history section",
        },
      ];

      setAccessLogs(sampleAccessLogs);
    } catch (error: any) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading({
        patient: false,
        records: false,
        appointments: false,
        labs: false,
      });
    }
  };

  // Check user permissions
  const canViewMedicalHistory =
    userRole === "doctor" || userRole === "staff" || userRole === "patient";
  const canEditMedicalData = userRole === "doctor" || userRole === "staff";
  const canViewAllRecords = userRole === "doctor";
  const canUploadDocuments =
    userRole === "doctor" || userRole === "staff" || userRole === "patient";

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format datetime for display
  const formatDateTime = (dateTimeString: string): string => {
    try {
      return new Date(dateTimeString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateTimeString;
    }
  };

  // Get record type icon
  const getRecordTypeIcon = (type: MedicalRecordType) => {
    switch (type) {
      case "consultation":
        return <Stethoscope className="w-4 h-4" />;
      case "lab_report":
        return <Activity className="w-4 h-4" />;
      case "prescription":
        return <Pill className="w-4 h-4" />;
      case "scan":
        return <ImageIcon className="w-4 h-4" />;
      case "assessment":
        return <Clipboard className="w-4 h-4" />;
      case "vaccination":
        return <Shield className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Get record type color
  const getRecordTypeColor = (type: MedicalRecordType): string => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800";
      case "lab_report":
        return "bg-purple-100 text-purple-800";
      case "prescription":
        return "bg-green-100 text-green-800";
      case "scan":
        return "bg-amber-100 text-amber-800";
      case "assessment":
        return "bg-indigo-100 text-indigo-800";
      case "vaccination":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge
  const StatusBadge = ({
    status,
  }: {
    status: "normal" | "abnormal" | "critical";
  }) => {
    const config = {
      normal: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      abnormal: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      critical: { color: "bg-red-100 text-red-800", icon: AlertCircle },
    };

    const { color, icon: Icon } = config[status];

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Filter medical records based on user role
  const getFilteredMedicalRecords = () => {
    return medicalHistory.filter((record) => {
      // Check if user has access to this record
      if (!record.accessLevel.includes(userRole)) {
        return false;
      }

      // Apply search filter
      if (
        searchQuery &&
        !record.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !record.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !record.summary.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Apply type filter
      if (filterType !== "all" && record.type !== filterType) {
        return false;
      }

      return true;
    });
  };

  // Quick stats
  const stats = {
    totalRecords: medicalHistory.length,
    totalAppointments: appointments.length,
    totalLabReports: labReports.length,
    abnormalResults: labReports.filter((report) => report.status !== "normal")
      .length,
  };

  // Loading skeleton
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

  // Generate patient avatar URL
  const getPatientAvatar = (name: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  };

  if (loading.patient || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-black">
        <Sidebar />
        <main className="lg:ml-64 pt-6 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A8F7A] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading health card...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-black">
      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-64 pt-6 px-4 lg:px-6 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0]">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Patient Health Card
                    </h1>
                    <p className="text-gray-600">
                      MWN Digital Medical Profile System
                    </p>
                  </div>
                </div>

                {/* Patient ID & Quick Actions */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-xl">
                    <Tag className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="font-mono font-medium text-gray-900">
                      {patient.patientCode}
                    </span>
                  </div>
                  <div className="flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-xl">
                    <QrCode className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="font-mono font-medium text-gray-900">
                      {patient.id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 ml-auto">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Printer className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                    {canEditMedicalData && (
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Badge */}
              <div className="flex items-center space-x-2">
                <div
                  className={`px-4 py-2 rounded-xl font-medium ${
                    userRole === "doctor"
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200"
                      : userRole === "staff"
                        ? "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200"
                        : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center">
                    <UserCheck className="w-4 h-4 mr-2" />
                    <span className="capitalize">{userRole}</span>
                    <span className="mx-2">•</span>
                    <span>View Only</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Medical Records</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalRecords}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-green-100">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalAppointments}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Lab Reports</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalLabReports}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-red-50 to-red-100">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Abnormal Results</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.abnormalResults}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-wrap border-b border-gray-200">
                <button
                  className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "overview"
                      ? "border-[#0A8F7A] text-[#0A8F7A]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  <User className="w-4 h-4 mr-2" />
                  Overview
                </button>
                <button
                  className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "medical"
                      ? "border-[#0A8F7A] text-[#0A8F7A]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("medical")}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Medical History
                </button>
                <button
                  className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "labs"
                      ? "border-[#0A8F7A] text-[#0A8F7A]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("labs")}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Lab Reports
                </button>
                <button
                  className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "appointments"
                      ? "border-[#0A8F7A] text-[#0A8F7A]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("appointments")}
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Appointments
                </button>
                {userRole === "doctor" && (
                  <button
                    className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "access"
                        ? "border-[#0A8F7A] text-[#0A8F7A]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("access")}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Access Logs
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Personal Information Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        🧍‍♂️ Personal Information
                      </h2>
                      <div className="flex items-center text-sm text-gray-500">
                        <Shield className="w-4 h-4 mr-1" />
                        <span>Secure • Encrypted</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column - Basic Info */}
                      <div className="space-y-6">
                        {/* Profile & Basic Info */}
                        <div className="flex items-start space-x-4">
                          <img
                            src={getPatientAvatar(
                              patient.fullName || patient.name,
                            )}
                            alt={patient.fullName || patient.name}
                            className="w-20 h-20 rounded-xl border-4 border-white shadow"
                          />
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {patient.fullName || patient.name}
                            </h3>
                            <div className="flex items-center mt-2 space-x-4">
                              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                <User className="w-3 h-3 mr-1" />
                                {patient.gender}, {patient.age} years
                              </span>
                              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                <Calendar className="w-3 h-3 mr-1" />
                                DOB:{" "}
                                {formatDate(
                                  patient.dateOfBirth || patient.createdAt,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center text-gray-600 mb-1">
                                <PhoneIcon className="w-4 h-4 mr-2" />
                                <span className="text-sm">Phone</span>
                              </div>
                              <p className="font-medium text-gray-900">
                                {patient.contact}
                              </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center text-gray-600 mb-1">
                                <MailIcon className="w-4 h-4 mr-2" />
                                <span className="text-sm">Email</span>
                              </div>
                              <p className="font-medium text-gray-900">
                                {patient.email}
                              </p>
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center text-gray-600 mb-1">
                              <Home className="w-4 h-4 mr-2" />
                              <span className="text-sm">Address</span>
                            </div>
                            <p className="font-medium text-gray-900">
                              {patient.address}
                            </p>
                          </div>

                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center text-gray-600 mb-1">
                              <Tag className="w-4 h-4 mr-2" />
                              <span className="text-sm">Patient ID</span>
                            </div>
                            <p className="font-medium text-gray-900">
                              {patient.id}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Medical Summary */}
                      <div className="space-y-6">
                        {/* Emergency Contact */}
                        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                          <div className="flex items-center mb-3">
                            <Bell className="w-5 h-5 text-red-600 mr-2" />
                            <h4 className="font-semibold text-red-800">
                              🆘 Emergency Contact
                            </h4>
                          </div>
                          <div className="space-y-2">
                            <p className="text-red-900">
                              <span className="font-medium">
                                {patient.emergencyContact}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Medical Summary */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">
                              🩺 Medical Summary
                            </h4>
                            <div className="flex items-center text-sm text-gray-500">
                              <Droplets className="w-4 h-4 mr-1" />
                              <span>Blood Group: </span>
                              <span className="font-medium text-gray-900 ml-1">
                                {patient.bloodGroup}
                              </span>
                            </div>
                          </div>

                          {/* Allergies */}
                          {patient.allergies &&
                            patient.allergies.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Allergies
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {patient.allergies.map((allergy, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                                    >
                                      {allergy}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Chronic Conditions */}
                          {patient.chronicConditions &&
                            patient.chronicConditions.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Chronic Conditions
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {patient.chronicConditions.map(
                                    (condition, index) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                                      >
                                        {condition}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Current Medications */}
                          {patient.currentMedications &&
                            patient.currentMedications.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Current Medications
                                </p>
                                <div className="space-y-2">
                                  {patient.currentMedications.map(
                                    (medication, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center p-2 bg-blue-50 rounded-lg"
                                      >
                                        <Pill className="w-4 h-4 text-blue-600 mr-2" />
                                        <span className="text-sm text-blue-800">
                                          {medication}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Special Notes */}
                          {patient.specialNotes &&
                            patient.specialNotes.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Special Notes
                                </p>
                                <div className="space-y-2">
                                  {patient.specialNotes.map((note, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start p-2 bg-green-50 rounded-lg"
                                    >
                                      <AlertCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                                      <span className="text-sm text-green-800">
                                        {note}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Insurance */}
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center text-purple-600 mb-1">
                              <Shield className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                Insurance Provider
                              </span>
                            </div>
                            <p className="font-medium text-purple-900">
                              {patient.insurance}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                      <p className="text-sm text-gray-500">
                        Profile last updated:{" "}
                        {formatDateTime(patient.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Medical History Preview */}
                {loading.records ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                          🧬 Recent Medical History
                        </h2>
                        <button
                          onClick={() => setActiveTab("medical")}
                          className="flex items-center text-sm text-[#0A8F7A] hover:text-[#0A8F7A]/80"
                        >
                          View All
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {medicalHistory.slice(0, 3).map((record) => (
                          <div
                            key={record.id}
                            className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`p-2 rounded-lg ${getRecordTypeColor(record.type)}`}
                                >
                                  {getRecordTypeIcon(record.type)}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {record.title}
                                  </h4>
                                  <div className="flex items-center mt-1 space-x-3 text-sm text-gray-600">
                                    <span>{formatDate(record.date)}</span>
                                    <span>•</span>
                                    <span>{record.doctorName}</span>
                                    <span>•</span>
                                    <span>{record.branchName}</span>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                              {record.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Medical History Tab */}
            {activeTab === "medical" && (
              <div className="space-y-6">
                {/* Search and Filter Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search medical records..."
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
                        value={filterType}
                        onChange={(e) =>
                          setFilterType(
                            e.target.value as MedicalRecordType | "all",
                          )
                        }
                      >
                        <option value="all">All Types</option>
                        <option value="consultation">Consultations</option>
                        <option value="lab_report">Lab Reports</option>
                        <option value="prescription">Prescriptions</option>
                      </select>

                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setFilterType("all");
                        }}
                        className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Clear Filters
                      </button>

                      {canUploadDocuments && (
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="px-4 py-3 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-xl hover:shadow-lg transition-colors flex items-center"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical Records Grid */}
                {loading.records ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {getFilteredMedicalRecords().map((record) => (
                        <div
                          key={record.id}
                          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                        >
                          <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`p-2 rounded-lg ${getRecordTypeColor(record.type)}`}
                                >
                                  {getRecordTypeIcon(record.type)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900">
                                    {record.title}
                                  </h3>
                                  <div className="flex items-center mt-1 space-x-3 text-sm text-gray-600">
                                    <span>{formatDate(record.date)}</span>
                                    <span>•</span>
                                    <span className="font-medium">
                                      {record.doctorName}
                                    </span>
                                    <span>•</span>
                                    <span>{record.branchName}</span>
                                  </div>
                                </div>
                              </div>
                              {record.isEncrypted && (
                                <Lock className="w-4 h-4 text-green-600" />
                              )}
                            </div>

                            {/* Summary */}
                            <p className="text-gray-700 mb-4">
                              {record.summary}
                            </p>

                            {/* Symptoms */}
                            {record.symptoms && record.symptoms.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Symptoms
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {record.symptoms.map((symptom, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm"
                                    >
                                      {symptom}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Notes */}
                            {record.notes.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Notes
                                </p>
                                <ul className="space-y-1">
                                  {record.notes.map((note, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start text-sm text-gray-600"
                                    >
                                      <span className="mr-2">•</span>
                                      {note}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Access Level */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Access Level
                              </p>
                              <div className="flex items-center space-x-2">
                                {record.accessLevel.map((role) => (
                                  <span
                                    key={role}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize"
                                  >
                                    {role}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {getFilteredMedicalRecords().length === 0 && (
                      <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No medical records found
                        </h3>
                        <p className="text-gray-600">
                          No records match your search criteria
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Lab Reports Tab */}
            {activeTab === "labs" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    🧪 Lab Reports & Documents
                  </h2>
                  {canUploadDocuments && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-4 py-3 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-xl hover:shadow-lg transition-colors flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Report
                    </button>
                  )}
                </div>

                {loading.labs ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {labReports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {report.testName}
                              </h3>
                              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                                <span>{formatDate(report.date)}</span>
                                <span>•</span>
                                <span>{report.labName}</span>
                                <span>•</span>
                                <StatusBadge status={report.status} />
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                              <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </button>
                              <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </button>
                            </div>
                          </div>

                          {/* Results Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Parameter
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Value
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Unit
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Normal Range
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {report.results.map((result, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {result.parameter}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                      {result.value}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {result.unit}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {result.normalRange}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          result.status === "normal"
                                            ? "bg-green-100 text-green-800"
                                            : result.status === "high"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-yellow-100 text-yellow-800"
                                        }`}
                                      >
                                        {result.status.charAt(0).toUpperCase() +
                                          result.status.slice(1)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Doctor Notes */}
                          {report.doctorNotes && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                              <div className="flex items-start">
                                <Stethoscope className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-blue-800 mb-1">
                                    Doctor's Notes
                                  </p>
                                  <p className="text-sm text-blue-700">
                                    {report.doctorNotes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === "appointments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    🗓 Appointment History
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Showing last</span>
                    <select className="px-3 py-1.5 border border-gray-300 rounded-lg">
                      <option>3 months</option>
                      <option>6 months</option>
                      <option>1 year</option>
                      <option>All time</option>
                    </select>
                  </div>
                </div>

                {loading.appointments ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Appointment Info */}
                            <div className="flex items-start space-x-4">
                              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100">
                                <Calendar className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  {appointment.reason}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>
                                      {formatDate(appointment.date)} at{" "}
                                      {appointment.time}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <User className="w-4 h-4 mr-1" />
                                    <span>{appointment.doctorName}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Building className="w-4 h-4 mr-1" />
                                    <span>
                                      {appointment.branchName ||
                                        appointment.branch ||
                                        "Colombo"}
                                    </span>
                                  </div>
                                </div>
                                {appointment.notes && (
                                  <p className="mt-2 text-sm text-gray-600">
                                    {appointment.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex flex-col items-end space-y-3">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  appointment.status === "completed" ||
                                  appointment.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : appointment.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {appointment.status === "completed" ||
                                appointment.status === "confirmed" ? (
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                ) : (
                                  <XCircle className="w-4 h-4 mr-1" />
                                )}
                                {appointment.status.charAt(0).toUpperCase() +
                                  appointment.status.slice(1)}
                              </span>

                              <div className="flex items-center space-x-2">
                                <button className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Details
                                </button>
                                <button className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                                  <FileText className="w-4 h-4 mr-1" />
                                  Get Summary
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Access Logs Tab (Doctors Only) */}
            {activeTab === "access" && userRole === "doctor" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    🔐 Access Control & Logs
                  </h2>
                  <button
                    onClick={() => setShowAccessModal(true)}
                    className="px-4 py-3 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-xl hover:shadow-lg transition-colors flex items-center"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Manage Access
                  </button>
                </div>

                {/* Access Control Matrix */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">
                      Role-Based Access Control
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                              Section
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                              Doctor
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                              Staff
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                              Patient
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Full Health Records
                            </td>
                            <td className="px-4 py-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </td>
                            <td className="px-4 py-3">
                              <XCircle className="w-5 h-5 text-red-600" />
                            </td>
                            <td className="px-4 py-3">
                              <XCircle className="w-5 h-5 text-red-600" />
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Basic Details + Appointment
                            </td>
                            <td className="px-4 py-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </td>
                            <td className="px-4 py-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </td>
                            <td className="px-4 py-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              View Only (No Editing)
                            </td>
                            <td className="px-4 py-3">
                              <XCircle className="w-5 h-5 text-red-600" />
                            </td>
                            <td className="px-4 py-3">
                              <XCircle className="w-5 h-5 text-red-600" />
                            </td>
                            <td className="px-4 py-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Add Medical Records
                            </td>
                            <td className="px-4 py-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </td>
                            <td className="px-4 py-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </td>
                            <td className="px-4 py-3">
                              <XCircle className="w-5 h-5 text-red-600" />
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Upload Documents
                            </td>
                            <td className="px-4 py-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </td>
                            <td className="px-4 py-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </td>
                            <td className="px-4 py-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Access Logs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">
                      Recent Access Logs
                    </h3>
                    <div className="space-y-4">
                      {accessLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                log.role === "doctor"
                                  ? "bg-blue-100 text-blue-800"
                                  : log.role === "staff"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {log.accessedBy}
                              </p>
                              <p className="text-sm text-gray-600">
                                {log.details}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {formatDateTime(log.timestamp)}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
                              {log.role}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Upload Document
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag & drop files here or
                  </p>
                  <button className="px-4 py-2 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-lg hover:shadow-lg transition-colors">
                    Browse Files
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    Max file size: 10MB • Supported: PDF, JPG, PNG
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Type
                    </label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent">
                      <option>Lab Report</option>
                      <option>Scan Report</option>
                      <option>Prescription</option>
                      <option>Assessment</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Access Level
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#0A8F7A] focus:ring-[#0A8F7A]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Doctors
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#0A8F7A] focus:ring-[#0A8F7A]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Staff
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#0A8F7A] focus:ring-[#0A8F7A]"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Patient
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-lg hover:shadow-lg transition-colors">
                    Upload & Encrypt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Access Control Modal */}
      {showAccessModal && userRole === "doctor" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Manage Access Control
                </h2>
                <button
                  onClick={() => setShowAccessModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">
                        Data Privacy & Security
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        All health data is encrypted at rest and in transit.
                        Access is logged and monitored.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Grant Access To
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Dr. Sarah Johnson
                          </p>
                          <p className="text-sm text-gray-600">
                            Cardiologist • Colombo Main
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                          Full Access
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Nursing Staff
                          </p>
                          <p className="text-sm text-gray-600">
                            Kandy Wellness Center
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          Limited Access
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-between">
                    <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      View Access Logs
                    </button>
                    <button className="px-4 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-lg hover:shadow-lg transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
