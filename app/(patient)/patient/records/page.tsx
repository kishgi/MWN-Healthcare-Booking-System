'use client';

import { useState, useEffect } from 'react';
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
  Smartphone
} from 'lucide-react';
import Sidebar from '../../../components/PatientSidebar';

// Types
type MedicalRecordType = 'consultation' | 'lab_report' | 'prescription' | 'scan' | 'assessment' | 'vaccination';
type AccessRole = 'doctor' | 'staff' | 'patient';
type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
type Gender = 'Male' | 'Female' | 'Other';
type AppointmentStatus = 'completed' | 'cancelled' | 'no_show';

interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  nic: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bloodGroup: BloodGroup;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  specialNotes: string[];
  createdAt: string;
  lastUpdated: string;
  patientCode: string;
  profileImage: string;
}

interface MedicalRecord {
  id: string;
  type: MedicalRecordType;
  title: string;
  date: string;
  doctorName: string;
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
}

interface LabReport {
  id: string;
  testName: string;
  date: string;
  labName: string;
  status: 'normal' | 'abnormal' | 'critical';
  results: Array<{
    parameter: string;
    value: string;
    unit: string;
    normalRange: string;
    status: 'normal' | 'high' | 'low';
  }>;
  doctorNotes: string;
  fileUrl: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  branchName: string;
  status: AppointmentStatus;
  reason: string;
  notes: string;
}

interface AccessLog {
  id: string;
  timestamp: string;
  accessedBy: string;
  role: AccessRole;
  action: 'viewed' | 'edited' | 'added' | 'downloaded';
  details: string;
}

export default function PatientHealthCard() {
  // State
  const [patient, setPatient] = useState<Patient>({
    id: 'PAT-2024-001234',
    fullName: 'John Michael Doe',
    dateOfBirth: '1985-06-15',
    age: 39,
    gender: 'Male',
    nic: '851234567V',
    phone: '+94 77 123 4567',
    email: 'john.doe@example.com',
    address: '123 Main Street, Colombo 03, Sri Lanka',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+94 77 987 6543'
    },
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts', 'Dust Mites'],
    chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
    currentMedications: [
      'Metformin 500mg - Twice daily',
      'Lisinopril 10mg - Once daily',
      'Atorvastatin 20mg - Once at night'
    ],
    specialNotes: [
      'History of allergic reactions to penicillin',
      'Regular exercise recommended',
      'Follow-up required every 3 months'
    ],
    createdAt: '2022-01-15',
    lastUpdated: '2024-12-01',
    patientCode: 'MWN-PAT-CLB-001',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  });

  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([
    {
      id: 'rec-001',
      type: 'consultation',
      title: 'Cardiology Consultation',
      date: '2024-11-15',
      doctorName: 'Dr. Sarah Johnson',
      branchName: 'Colombo Main Hospital',
      summary: 'Routine heart checkup and blood pressure monitoring',
      diagnosis: ['Hypertension Stage 1', 'High Cholesterol'],
      prescriptions: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days'
        }
      ],
      notes: ['Patient advised to reduce salt intake', 'Regular exercise recommended'],
      isEncrypted: true,
      accessLevel: ['doctor', 'staff']
    },
    {
      id: 'rec-002',
      type: 'lab_report',
      title: 'Complete Blood Count',
      date: '2024-11-10',
      doctorName: 'Dr. Michael Chen',
      branchName: 'Kandy Wellness Center',
      summary: 'Routine blood test for diabetes monitoring',
      notes: ['Fasting blood sugar levels elevated', 'Follow-up in 1 week'],
      attachments: ['blood_test_report.pdf'],
      isEncrypted: true,
      accessLevel: ['doctor', 'patient']
    },
    {
      id: 'rec-003',
      type: 'prescription',
      title: 'Diabetes Medication',
      date: '2024-11-05',
      doctorName: 'Dr. Emily Rodriguez',
      branchName: 'Galle Coastal Clinic',
      summary: 'Medication renewal and adjustment',
      prescriptions: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '90 days'
        }
      ],
      notes: ['Monitor blood sugar levels regularly'],
      isEncrypted: true,
      accessLevel: ['doctor', 'staff', 'patient']
    }
  ]);

  const [labReports, setLabReports] = useState<LabReport[]>([
    {
      id: 'lab-001',
      testName: 'Complete Blood Count (CBC)',
      date: '2024-11-10',
      labName: 'MWN Central Lab',
      status: 'normal',
      results: [
        {
          parameter: 'Hemoglobin',
          value: '14.2',
          unit: 'g/dL',
          normalRange: '13.5-17.5',
          status: 'normal'
        },
        {
          parameter: 'WBC Count',
          value: '7.5',
          unit: '10^3/μL',
          normalRange: '4.5-11.0',
          status: 'normal'
        },
        {
          parameter: 'Platelets',
          value: '250',
          unit: '10^3/μL',
          normalRange: '150-450',
          status: 'normal'
        }
      ],
      doctorNotes: 'All parameters within normal range. No immediate concerns.',
      fileUrl: 'cbc_report_2024-11-10.pdf'
    },
    {
      id: 'lab-002',
      testName: 'Fasting Blood Sugar',
      date: '2024-11-10',
      labName: 'MWN Central Lab',
      status: 'abnormal',
      results: [
        {
          parameter: 'Glucose (Fasting)',
          value: '145',
          unit: 'mg/dL',
          normalRange: '70-100',
          status: 'high'
        }
      ],
      doctorNotes: 'Elevated fasting blood sugar levels. Diabetes monitoring required.',
      fileUrl: 'glucose_test_2024-11-10.pdf'
    }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'app-001',
      date: '2024-11-15',
      time: '10:30 AM',
      doctorName: 'Dr. Sarah Johnson',
      branchName: 'Colombo Main Hospital',
      status: 'completed',
      reason: 'Cardiology Follow-up',
      notes: 'Blood pressure check and medication review'
    },
    {
      id: 'app-002',
      date: '2024-11-10',
      time: '2:00 PM',
      doctorName: 'Dr. Michael Chen',
      branchName: 'Kandy Wellness Center',
      status: 'completed',
      reason: 'Blood Test Results Review',
      notes: 'Discussed lab results and treatment plan'
    },
    {
      id: 'app-003',
      date: '2024-11-05',
      time: '9:00 AM',
      doctorName: 'Dr. Emily Rodriguez',
      branchName: 'Galle Coastal Clinic',
      status: 'completed',
      reason: 'Diabetes Checkup',
      notes: 'Medication adjustment and lifestyle counseling'
    }
  ]);

  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([
    {
      id: 'log-001',
      timestamp: '2024-12-01 14:30:00',
      accessedBy: 'Dr. Sarah Johnson',
      role: 'doctor',
      action: 'viewed',
      details: 'Viewed complete medical history'
    },
    {
      id: 'log-002',
      timestamp: '2024-11-30 11:15:00',
      accessedBy: 'Nurse Jane Smith',
      role: 'staff',
      action: 'added',
      details: 'Added new lab report'
    },
    {
      id: 'log-003',
      timestamp: '2024-11-29 09:45:00',
      accessedBy: 'John Doe',
      role: 'patient',
      action: 'viewed',
      details: 'Viewed medical history section'
    }
  ]);

  const [userRole] = useState<AccessRole>('patient'); // In real app, get from auth context
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'labs' | 'appointments' | 'access'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MedicalRecordType | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  // Check user permissions
  const canViewMedicalHistory = userRole === 'doctor' || userRole === 'staff' || userRole === 'patient';
  const canEditMedicalData = userRole === 'doctor' || userRole === 'staff';
  const canViewAllRecords = userRole === 'doctor';
  const canUploadDocuments = userRole === 'doctor' || userRole === 'staff' || userRole === 'patient';

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format datetime for display
  const formatDateTime = (dateTimeString: string): string => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get record type icon
  const getRecordTypeIcon = (type: MedicalRecordType) => {
    switch (type) {
      case 'consultation': return <Stethoscope className="w-4 h-4" />;
      case 'lab_report': return <Activity className="w-4 h-4" />;
      case 'prescription': return <Pill className="w-4 h-4" />;
      case 'scan': return <ImageIcon className="w-4 h-4" />;
      case 'assessment': return <Clipboard className="w-4 h-4" />;
      case 'vaccination': return <Shield className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get record type color
  const getRecordTypeColor = (type: MedicalRecordType): string => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'lab_report': return 'bg-purple-100 text-purple-800';
      case 'prescription': return 'bg-green-100 text-green-800';
      case 'scan': return 'bg-amber-100 text-amber-800';
      case 'assessment': return 'bg-indigo-100 text-indigo-800';
      case 'vaccination': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge
  const StatusBadge = ({ status }: { status: 'normal' | 'abnormal' | 'critical' }) => {
    const config = {
      normal: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      abnormal: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      critical: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };
    
    const { color, icon: Icon } = config[status];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Filter medical records based on user role
  const getFilteredMedicalRecords = () => {
    return medicalHistory.filter(record => {
      // Check if user has access to this record
      if (!record.accessLevel.includes(userRole)) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery && !record.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !record.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !record.summary.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply type filter
      if (filterType !== 'all' && record.type !== filterType) {
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
    abnormalResults: labReports.filter(report => report.status !== 'normal').length
  };

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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Patient Health Card</h1>
                    <p className="text-gray-600">MWN Digital Medical Profile System</p>
                  </div>
                </div>
                
                {/* Patient ID & Quick Actions */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-xl">
                    <Tag className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="font-mono font-medium text-gray-900">{patient.patientCode}</span>
                  </div>
                  <div className="flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-xl">
                    <QrCode className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="font-mono font-medium text-gray-900">{patient.id}</span>
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
                <div className={`px-4 py-2 rounded-xl font-medium ${
                  userRole === 'doctor' 
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200'
                    : userRole === 'staff'
                    ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200'
                    : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200'
                }`}>
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
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stats.totalLabReports}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stats.abnormalResults}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-wrap border-b border-gray-200">
                <button
                  className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-[#0A8F7A] text-[#0A8F7A]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Overview
                </button>
                <button
                  className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'medical'
                      ? 'border-[#0A8F7A] text-[#0A8F7A]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('medical')}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Medical History
                </button>
                <button
                  className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'labs'
                      ? 'border-[#0A8F7A] text-[#0A8F7A]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('labs')}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Lab Reports
                </button>
                <button
                  className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'appointments'
                      ? 'border-[#0A8F7A] text-[#0A8F7A]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Appointments
                </button>
                {userRole === 'doctor' && (
                  <button
                    className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'access'
                        ? 'border-[#0A8F7A] text-[#0A8F7A]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('access')}
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
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Personal Information Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">🧍‍♂️ Personal Information</h2>
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
                            src={patient.profileImage}
                            alt={patient.fullName}
                            className="w-20 h-20 rounded-xl border-4 border-white shadow"
                          />
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{patient.fullName}</h3>
                            <div className="flex items-center mt-2 space-x-4">
                              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                <User className="w-3 h-3 mr-1" />
                                {patient.gender}, {patient.age} years
                              </span>
                              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                <Calendar className="w-3 h-3 mr-1" />
                                DOB: {formatDate(patient.dateOfBirth)}
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
                              <p className="font-medium text-gray-900">{patient.phone}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center text-gray-600 mb-1">
                                <MailIcon className="w-4 h-4 mr-2" />
                                <span className="text-sm">Email</span>
                              </div>
                              <p className="font-medium text-gray-900">{patient.email}</p>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center text-gray-600 mb-1">
                              <Home className="w-4 h-4 mr-2" />
                              <span className="text-sm">Address</span>
                            </div>
                            <p className="font-medium text-gray-900">{patient.address}</p>
                          </div>
                          
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center text-gray-600 mb-1">
                              <Tag className="w-4 h-4 mr-2" />
                              <span className="text-sm">NIC / Passport</span>
                            </div>
                            <p className="font-medium text-gray-900">{patient.nic}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Column - Medical Summary */}
                      <div className="space-y-6">
                        {/* Emergency Contact */}
                        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                          <div className="flex items-center mb-3">
                            <Bell className="w-5 h-5 text-red-600 mr-2" />
                            <h4 className="font-semibold text-red-800">🆘 Emergency Contact</h4>
                          </div>
                          <div className="space-y-2">
                            <p className="text-red-900">
                              <span className="font-medium">{patient.emergencyContact.name}</span> 
                              <span className="text-red-700 ml-2">({patient.emergencyContact.relationship})</span>
                            </p>
                            <div className="flex items-center text-red-800">
                              <PhoneIcon className="w-4 h-4 mr-2" />
                              <span className="font-medium">{patient.emergencyContact.phone}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Medical Summary */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">🩺 Medical Summary</h4>
                            <div className="flex items-center text-sm text-gray-500">
                              <Droplets className="w-4 h-4 mr-1" />
                              <span>Blood Group: </span>
                              <span className="font-medium text-gray-900 ml-1">{patient.bloodGroup}</span>
                            </div>
                          </div>
                          
                          {/* Allergies */}
                          {patient.allergies.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Allergies</p>
                              <div className="flex flex-wrap gap-2">
                                {patient.allergies.map((allergy, index) => (
                                  <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                    {allergy}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Chronic Conditions */}
                          {patient.chronicConditions.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Chronic Conditions</p>
                              <div className="flex flex-wrap gap-2">
                                {patient.chronicConditions.map((condition, index) => (
                                  <span key={index} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                                    {condition}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Current Medications */}
                          {patient.currentMedications.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Current Medications</p>
                              <div className="space-y-2">
                                {patient.currentMedications.map((medication, index) => (
                                  <div key={index} className="flex items-center p-2 bg-blue-50 rounded-lg">
                                    <Pill className="w-4 h-4 text-blue-600 mr-2" />
                                    <span className="text-sm text-blue-800">{medication}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Special Notes */}
                          {patient.specialNotes.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Special Notes</p>
                              <div className="space-y-2">
                                {patient.specialNotes.map((note, index) => (
                                  <div key={index} className="flex items-start p-2 bg-green-50 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                                    <span className="text-sm text-green-800">{note}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Last Updated */}
                    <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                      <p className="text-sm text-gray-500">
                        Profile last updated: {formatDateTime(patient.lastUpdated)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Medical History Preview */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">🧬 Recent Medical History</h2>
                      <button
                        onClick={() => setActiveTab('medical')}
                        className="flex items-center text-sm text-[#0A8F7A] hover:text-[#0A8F7A]/80"
                      >
                        View All
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {medicalHistory.slice(0, 3).map(record => (
                        <div key={record.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getRecordTypeColor(record.type)}`}>
                                {getRecordTypeIcon(record.type)}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{record.title}</h4>
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
                          <p className="mt-2 text-sm text-gray-600">{record.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Medical History Tab */}
            {activeTab === 'medical' && (
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
                        onChange={(e) => setFilterType(e.target.value as MedicalRecordType | 'all')}
                      >
                        <option value="all">All Types</option>
                        <option value="consultation">Consultations</option>
                        <option value="lab_report">Lab Reports</option>
                        <option value="prescription">Prescriptions</option>
                        <option value="scan">Scans</option>
                        <option value="assessment">Assessments</option>
                        <option value="vaccination">Vaccinations</option>
                      </select>

                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterType('all');
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getFilteredMedicalRecords().map(record => (
                    <div key={record.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getRecordTypeColor(record.type)}`}>
                              {getRecordTypeIcon(record.type)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{record.title}</h3>
                              <div className="flex items-center mt-1 space-x-3 text-sm text-gray-600">
                                <span>{formatDate(record.date)}</span>
                                <span>•</span>
                                <span className="font-medium">{record.doctorName}</span>
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
                        <p className="text-gray-700 mb-4">{record.summary}</p>
                        
                        {/* Diagnosis */}
                        {record.diagnosis && record.diagnosis.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Diagnosis</p>
                            <div className="flex flex-wrap gap-2">
                              {record.diagnosis.map((diag, index) => (
                                <span key={index} className="px-3 py-1 bg-red-50 text-red-800 rounded-full text-sm">
                                  {diag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Prescriptions */}
                        {record.prescriptions && record.prescriptions.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Prescriptions</p>
                            <div className="space-y-2">
                              {record.prescriptions.map((pres, index) => (
                                <div key={index} className="p-2 bg-blue-50 rounded-lg">
                                  <div className="flex justify-between">
                                    <span className="font-medium text-blue-800">{pres.name}</span>
                                    <span className="text-sm text-blue-600">{pres.dosage}</span>
                                  </div>
                                  <div className="text-sm text-blue-700 mt-1">
                                    {pres.frequency} • {pres.duration}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Notes */}
                        {record.notes.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                            <ul className="space-y-1">
                              {record.notes.map((note, index) => (
                                <li key={index} className="flex items-start text-sm text-gray-600">
                                  <span className="mr-2">•</span>
                                  {note}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Attachments */}
                        {record.attachments && record.attachments.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
                            <div className="flex flex-wrap gap-2">
                              {record.attachments.map((file, index) => (
                                <button
                                  key={index}
                                  className="flex items-center px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <File className="w-4 h-4 mr-2 text-gray-500" />
                                  <span className="text-sm text-gray-700">{file}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Access Level */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Access Level</p>
                          <div className="flex items-center space-x-2">
                            {record.accessLevel.map(role => (
                              <span key={role} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
                    <p className="text-gray-600">No records match your search criteria</p>
                  </div>
                )}
              </div>
            )}

            {/* Lab Reports Tab */}
            {activeTab === 'labs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">🧪 Lab Reports & Documents</h2>
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
                
                <div className="grid grid-cols-1 gap-6">
                  {labReports.map(report => (
                    <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{report.testName}</h3>
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
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Parameter</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Value</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unit</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Normal Range</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {report.results.map((result, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{result.parameter}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{result.value}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{result.unit}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{result.normalRange}</td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      result.status === 'normal'
                                        ? 'bg-green-100 text-green-800'
                                        : result.status === 'high'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
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
                                <p className="text-sm font-medium text-blue-800 mb-1">Doctor's Notes</p>
                                <p className="text-sm text-blue-700">{report.doctorNotes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">🗓 Appointment History</h2>
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
                
                <div className="space-y-4">
                  {appointments.map(appointment => (
                    <div key={appointment.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Appointment Info */}
                          <div className="flex items-start space-x-4">
                            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100">
                              <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{appointment.reason}</h3>
                              <div className="flex flex-wrap items-center gap-4 mt-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>{formatDate(appointment.date)} at {appointment.time}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <User className="w-4 h-4 mr-1" />
                                  <span>{appointment.doctorName}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Building className="w-4 h-4 mr-1" />
                                  <span>{appointment.branchName}</span>
                                </div>
                              </div>
                              {appointment.notes && (
                                <p className="mt-2 text-sm text-gray-600">{appointment.notes}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Status & Actions */}
                          <div className="flex flex-col items-end space-y-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              appointment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-1" />
                              )}
                              {appointment.status.replace('_', ' ').charAt(0).toUpperCase() + appointment.status.slice(1).replace('_', ' ')}
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
              </div>
            )}

            {/* Access Logs Tab (Doctors Only) */}
            {activeTab === 'access' && userRole === 'doctor' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">🔐 Access Control & Logs</h2>
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
                    <h3 className="font-bold text-gray-900 mb-4">Role-Based Access Control</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Doctor</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Staff</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Full Health Records</td>
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
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Basic Details + Appointment</td>
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
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">View Only (No Editing)</td>
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
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Add Medical Records</td>
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
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Upload Documents</td>
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
                    <h3 className="font-bold text-gray-900 mb-4">Recent Access Logs</h3>
                    <div className="space-y-4">
                      {accessLogs.map(log => (
                        <div key={log.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              log.role === 'doctor' 
                                ? 'bg-blue-100 text-blue-800'
                                : log.role === 'staff'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{log.accessedBy}</p>
                              <p className="text-sm text-gray-600">{log.details}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatDateTime(log.timestamp)}</p>
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
                <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
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
                  <p className="text-gray-600 mb-2">Drag & drop files here or</p>
                  <button className="px-4 py-2 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-lg hover:shadow-lg transition-colors">
                    Browse Files
                  </button>
                  <p className="text-xs text-gray-500 mt-4">Max file size: 10MB • Supported: PDF, JPG, PNG</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent">
                      <option>Lab Report</option>
                      <option>Scan Report</option>
                      <option>Prescription</option>
                      <option>Assessment</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-[#0A8F7A] focus:ring-[#0A8F7A]" />
                        <span className="ml-2 text-sm text-gray-700">Doctors</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-[#0A8F7A] focus:ring-[#0A8F7A]" />
                        <span className="ml-2 text-sm text-gray-700">Staff</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-[#0A8F7A] focus:ring-[#0A8F7A]" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">Patient</span>
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
      {showAccessModal && userRole === 'doctor' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Manage Access Control</h2>
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
                      <p className="font-medium text-blue-800">Data Privacy & Security</p>
                      <p className="text-sm text-blue-700 mt-1">
                        All health data is encrypted at rest and in transit. Access is logged and monitored.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Grant Access To</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Dr. Sarah Johnson</p>
                          <p className="text-sm text-gray-600">Cardiologist • Colombo Main</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Full Access</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Nursing Staff</p>
                          <p className="text-sm text-gray-600">Kandy Wellness Center</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">Limited Access</span>
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