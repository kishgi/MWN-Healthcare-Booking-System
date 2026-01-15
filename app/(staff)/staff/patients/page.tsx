'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../../components/StaffSidebar';
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
  Bell,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter as FilterIcon,
  Plus,
  X,
  MessageSquare,
  Shield,
  Activity,
  Pill
} from 'lucide-react';

// Types
type Gender = 'Male' | 'Female' | 'Other';
type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  bloodGroup?: BloodGroup;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  allergies?: string[];
  registeredDate: string;
  lastVisit?: string;
  status: 'active' | 'inactive';
  insuranceId?: string;
  primaryDoctorId?: string;
  avatar?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  token: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  symptoms?: string[];
  branchName: string;
}

export default function PatientsPage() {
  // State
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'P-001',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      dateOfBirth: '1989-05-15',
      age: 35,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@email.com',
      address: '123 Main St, New York, NY 10001',
      emergencyContact: '+1 (555) 987-6543',
      medicalHistory: ['Hypertension', 'Asthma'],
      allergies: ['Penicillin', 'Peanuts'],
      registeredDate: '2023-01-15',
      lastVisit: '2024-11-20',
      status: 'active',
      insuranceId: 'INS-789456',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'APP-001',
      patientId: 'P-001',
      doctorId: 'D-001',
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialization: 'Cardiologist',
      date: '2024-12-15',
      time: '10:30 AM',
      token: 'TK-2024-001',
      reason: 'Routine heart checkup',
      status: 'confirmed',
      symptoms: ['Chest discomfort', 'Shortness of breath'],
      branchName: 'City Medical Center'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    status: '',
    bloodGroup: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentHistoryModal, setShowAppointmentHistoryModal] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '' as Gender | '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '' as BloodGroup | '',
    medicalHistory: [] as string[],
    allergies: [] as string[]
  });

  // Apply filters and search
  const filteredPatients = patients
    .filter(patient => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          patient.fullName.toLowerCase().includes(searchLower) ||
          patient.phone.includes(searchQuery) ||
          patient.email?.toLowerCase().includes(searchLower) ||
          patient.id.toLowerCase().includes(searchLower) ||
          patient.insuranceId?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Gender filter
      if (filters.gender && patient.gender !== filters.gender) return false;
      
      // Status filter
      if (filters.status && patient.status !== filters.status) return false;
      
      // Blood group filter
      if (filters.bloodGroup && patient.bloodGroup !== filters.bloodGroup) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      const { key, direction } = sortConfig;
      let aValue: any = a[key as keyof Patient];
      let bValue: any = b[key as keyof Patient];
      
      // Handle date sorting
      if (key === 'dateOfBirth' || key === 'registeredDate' || key === 'lastVisit') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }
      
      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  // Handle sort
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Open Patient Details Modal
  const handleViewPatientDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  // Open Appointment History Modal
  const handleViewAppointmentHistory = (patient: Patient) => {
    setSelectedPatient(patient);
    const patientAppts = appointments.filter(appt => appt.patientId === patient.id);
    setPatientAppointments(patientAppts);
    setShowAppointmentHistoryModal(true);
  };

  // Handle New Patient Registration
  const handleAddNewPatient = () => {
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.dateOfBirth || !newPatient.gender || !newPatient.phone) {
      alert('Please fill in all required fields');
      return;
    }

    const newPatientObj: Patient = {
      id: `P-${String(patients.length + 1).padStart(3, '0')}`,
      firstName: newPatient.firstName,
      lastName: newPatient.lastName,
      fullName: `${newPatient.firstName} ${newPatient.lastName}`,
      dateOfBirth: newPatient.dateOfBirth,
      age: calculateAge(newPatient.dateOfBirth),
      gender: newPatient.gender,
      bloodGroup: newPatient.bloodGroup || undefined,
      phone: newPatient.phone,
      email: newPatient.email || undefined,
      address: newPatient.address || undefined,
      emergencyContact: newPatient.emergencyContact || undefined,
      medicalHistory: newPatient.medicalHistory,
      allergies: newPatient.allergies,
      registeredDate: new Date().toISOString().split('T')[0],
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newPatient.firstName}`
    };

    setPatients([newPatientObj, ...patients]);
    setShowNewPatientModal(false);
    resetNewPatientForm();
    alert('Patient registered successfully!');
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };

  // Reset new patient form
  const resetNewPatientForm = () => {
    setNewPatient({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      bloodGroup: '',
      medicalHistory: [],
      allergies: []
    });
  };

  // Handle delete patient
  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  // Confirm delete patient
  const handleConfirmDelete = () => {
    if (selectedPatient) {
      setPatients(patients.filter(p => p.id !== selectedPatient.id));
      setShowDeleteModal(false);
      setSelectedPatient(null);
      alert('Patient deleted successfully!');
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Status Badge component
  const StatusBadge = ({ status }: { status: 'active' | 'inactive' }) => {
    const config = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const { color, icon: Icon } = config[status];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Appointment Status Badge
  const AppointmentStatusBadge = ({ status }: { status: AppointmentStatus }) => {
    const config = {
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const { color, icon: Icon } = config[status];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Sidebar />
      
      {/* Main Content */}
      <main className="lg:ml-64 lg:pt-6 lg:px-6 transition-all duration-300 ease-in-out text-black">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Patient Management</h1>
                <p className="text-gray-600 mt-2">Register, search, and manage patient records</p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
                  onClick={() => setShowNewPatientModal(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register New Patient
                </button>
                <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total Patients</p>
                    <p className="text-lg font-bold text-gray-900">{patients.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Active Patients</p>
                    <p className="text-lg font-bold text-gray-900">{patients.filter(p => p.status === 'active').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Activity className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">New This Month</p>
                    <p className="text-lg font-bold text-gray-900">4</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Appointments Today</p>
                    <p className="text-lg font-bold text-gray-900">12</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by patient name, ID, phone, email, or insurance ID..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
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
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <FilterIcon className="w-5 h-5 mr-2" />
                  Filters
                  {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </button>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ gender: '', status: '', bloodGroup: '' });
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={filters.gender}
                      onChange={(e) => {
                        setFilters({...filters, gender: e.target.value});
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Genders</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>

                    <select
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={filters.status}
                      onChange={(e) => {
                        setFilters({...filters, status: e.target.value});
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    <select
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={filters.bloodGroup}
                      onChange={(e) => {
                        setFilters({...filters, bloodGroup: e.target.value});
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
              )}
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('fullName')}
                      >
                        <div className="flex items-center">
                          Patient Name
                          {sortConfig?.key === 'fullName' && (
                            sortConfig.direction === 'asc' ? 
                            <ChevronUp className="w-4 h-4 ml-1" /> : 
                            <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('age')}
                      >
                        <div className="flex items-center">
                          Age/Gender
                          {sortConfig?.key === 'age' && (
                            sortConfig.direction === 'asc' ? 
                            <ChevronUp className="w-4 h-4 ml-1" /> : 
                            <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medical Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentPatients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                          <p className="text-gray-600 mb-4">
                            {searchQuery || Object.values(filters).some(f => f) 
                              ? 'Try adjusting your search or filters' 
                              : 'No patients registered yet'}
                          </p>
                          <button
                            onClick={() => setShowNewPatientModal(true)}
                            className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
                          >
                            <UserPlus className="w-5 h-5 mr-2" />
                            Register First Patient
                          </button>
                        </td>
                      </tr>
                    ) : (
                      currentPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                          {/* Patient Name Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={patient.avatar}
                                alt={patient.fullName}
                                className="w-10 h-10 rounded-lg bg-gray-100"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{patient.fullName}</div>
                                <div className="text-sm text-gray-500">ID: {patient.id}</div>
                                <div className="text-xs text-gray-500">Registered: {formatDate(patient.registeredDate)}</div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Age/Gender Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{patient.age} years</div>
                              <div className="text-sm text-gray-500">{patient.gender}</div>
                              <div className="text-xs text-gray-500">
                                DOB: {formatDate(patient.dateOfBirth)}
                              </div>
                            </div>
                          </td>
                          
                          {/* Contact Info Column */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 flex items-center">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              {patient.phone}
                            </div>
                            {patient.email && (
                              <div className="text-sm text-gray-500 flex items-center mt-1">
                                <Mail className="w-3 h-3 mr-1 text-gray-400" />
                                {patient.email}
                              </div>
                            )}
                            {patient.address && (
                              <div className="text-xs text-gray-500 truncate max-w-xs mt-1 flex items-start">
                                <MapPin className="w-3 h-3 mr-1 text-gray-400 mt-0.5 flex-shrink-0" />
                                {patient.address}
                              </div>
                            )}
                          </td>
                          
                          {/* Medical Info Column */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {patient.bloodGroup && (
                                <div className="flex items-center mb-1">
                                  <Heart className="w-3 h-3 mr-1 text-red-400" />
                                  Blood: {patient.bloodGroup}
                                </div>
                              )}
                              {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                  Conditions: {patient.medicalHistory.join(', ')}
                                </div>
                              )}
                              {patient.allergies && patient.allergies.length > 0 && (
                                <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                                  Allergies: {patient.allergies.join(', ')}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Status Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={patient.status} />
                            {patient.lastVisit && (
                              <div className="text-xs text-gray-500 mt-1">
                                Last Visit: {formatDate(patient.lastVisit)}
                              </div>
                            )}
                          </td>
                          
                          {/* Actions Column */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewPatientDetails(patient)}
                                className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                View
                              </button>
                              <button
                                onClick={() => handleViewAppointmentHistory(patient)}
                                className="inline-flex items-center px-3 py-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                                title="Appointment History"
                              >
                                <Calendar className="w-3.5 h-3.5 mr-1" />
                                History
                              </button>
                              <button
                                onClick={() => handleDeletePatient(patient)}
                                className="inline-flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete Patient"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
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
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredPatients.length)}</span> of{' '}
                    <span className="font-medium">{filteredPatients.length}</span> patients
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-[#0A8F7A] text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
                  <p className="text-gray-600">Complete patient information and records</p>
                </div>
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Patient Profile */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6">
                <div className="flex items-start">
                  <img
                    src={selectedPatient.avatar}
                    alt={selectedPatient.fullName}
                    className="w-20 h-20 rounded-xl bg-white shadow-sm"
                  />
                  <div className="ml-6">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedPatient.fullName}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-gray-600">ID: {selectedPatient.id}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-gray-600">{selectedPatient.age} years, {selectedPatient.gender}</span>
                      </div>
                      <StatusBadge status={selectedPatient.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Date of Birth</label>
                      <p className="text-gray-900">{formatDate(selectedPatient.dateOfBirth)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Blood Group</label>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-red-500 mr-2" />
                        <p className="text-gray-900">{selectedPatient.bloodGroup || 'Not specified'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Registered Date</label>
                      <p className="text-gray-900">{formatDate(selectedPatient.registeredDate)}</p>
                    </div>
                    {selectedPatient.lastVisit && (
                      <div>
                        <label className="text-sm text-gray-500">Last Visit</label>
                        <p className="text-gray-900">{formatDate(selectedPatient.lastVisit)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-green-600" />
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Phone Number</label>
                      <p className="text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedPatient.phone}
                      </p>
                    </div>
                    {selectedPatient.email && (
                      <div>
                        <label className="text-sm text-gray-500">Email Address</label>
                        <p className="text-gray-900 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedPatient.email}
                        </p>
                      </div>
                    )}
                    {selectedPatient.address && (
                      <div>
                        <label className="text-sm text-gray-500">Address</label>
                        <p className="text-gray-900 flex items-start">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                          {selectedPatient.address}
                        </p>
                      </div>
                    )}
                    {selectedPatient.emergencyContact && (
                      <div>
                        <label className="text-sm text-gray-500">Emergency Contact</label>
                        <p className="text-gray-900">{selectedPatient.emergencyContact}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-red-600" />
                    Medical Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Medical History</label>
                      {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedPatient.medicalHistory.map((condition, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs">
                              {condition}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No medical history recorded</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Allergies</label>
                      {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedPatient.allergies.map((allergy, index) => (
                            <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No known allergies</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-purple-600" />
                    Insurance Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Insurance ID</label>
                      <p className="text-gray-900">{selectedPatient.insuranceId || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Quick Actions</label>
                      <div className="flex space-x-2 mt-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Schedule Appointment
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          Update Records
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleViewAppointmentHistory(selectedPatient)}
                  className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Appointment History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment History Modal */}
      {showAppointmentHistoryModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Appointment History</h2>
                  <p className="text-gray-600">All appointments for {selectedPatient.fullName}</p>
                </div>
                <button
                  onClick={() => setShowAppointmentHistoryModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Patient Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={selectedPatient.avatar}
                    alt={selectedPatient.fullName}
                    className="w-12 h-12 rounded-lg bg-white"
                  />
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">{selectedPatient.fullName}</h3>
                    <p className="text-sm text-gray-600">ID: {selectedPatient.id} • {patientAppointments.length} Appointments</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#0A8F7A] text-white rounded-lg hover:bg-[#098d78] transition-colors">
                  Schedule New Appointment
                </button>
              </div>

              {/* Appointments Table */}
              {patientAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointment History</h3>
                  <p className="text-gray-600 mb-6">This patient has no previous appointments.</p>
                  <button className="px-6 py-2.5 bg-[#0A8F7A] text-white font-medium rounded-lg hover:bg-[#098d78] transition-colors">
                    Schedule First Appointment
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doctor & Specialization
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reason
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Branch
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Token
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {patientAppointments.map((appointment) => (
                          <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{formatDate(appointment.date)}</div>
                              <div className="text-sm text-gray-500">{appointment.time}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{appointment.doctorName}</div>
                              <div className="text-sm text-gray-500">{appointment.doctorSpecialization}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{appointment.reason}</div>
                              {appointment.symptoms && appointment.symptoms.length > 0 && (
                                <div className="text-xs text-gray-500">
                                  Symptoms: {appointment.symptoms.join(', ')}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{appointment.branchName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <AppointmentStatusBadge status={appointment.status} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-mono text-gray-900">{appointment.token}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-sm text-blue-600">Total Appointments</div>
                      <div className="text-2xl font-bold text-gray-900">{patientAppointments.length}</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-sm text-green-600">Completed</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {patientAppointments.filter(a => a.status === 'completed').length}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="text-sm text-purple-600">Upcoming</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {patientAppointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Modal Footer */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setShowAppointmentHistoryModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowAppointmentHistoryModal(false);
                    setShowPatientModal(true);
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Patient Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Patient Registration Modal */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Register New Patient</h2>
                  <p className="text-gray-600">Enter patient details to create a new record</p>
                </div>
                <button
                  onClick={() => {
                    setShowNewPatientModal(false);
                    resetNewPatientForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Registration Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={newPatient.firstName}
                      onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={newPatient.lastName}
                      onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={newPatient.dateOfBirth}
                      onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({...newPatient, gender: e.target.value as Gender})}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={newPatient.bloodGroup}
                      onChange={(e) => setNewPatient({...newPatient, bloodGroup: e.target.value as BloodGroup})}
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
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      rows={2}
                      value={newPatient.address}
                      onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={newPatient.emergencyContact}
                      onChange={(e) => setNewPatient({...newPatient, emergencyContact: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical History (comma separated)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      placeholder="e.g., Hypertension, Diabetes"
                      value={newPatient.medicalHistory.join(', ')}
                      onChange={(e) => setNewPatient({
                        ...newPatient, 
                        medicalHistory: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies (comma separated)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      placeholder="e.g., Penicillin, Peanuts"
                      value={newPatient.allergies.join(', ')}
                      onChange={(e) => setNewPatient({
                        ...newPatient, 
                        allergies: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setShowNewPatientModal(false);
                    resetNewPatientForm();
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewPatient}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Register Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Patient Record</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this patient record? This action cannot be undone and will remove all associated data.
              </p>

              <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <img
                      src={selectedPatient.avatar}
                      alt={selectedPatient.fullName}
                      className="w-12 h-12 rounded-lg mr-3"
                    />
                    <div>
                      <p className="font-medium text-red-800">{selectedPatient.fullName}</p>
                      <p className="text-sm text-red-700">ID: {selectedPatient.id}</p>
                    </div>
                  </div>
                  <p className="text-sm text-red-600 mt-2">
                    {selectedPatient.age} years • {selectedPatient.gender} • {selectedPatient.phone}
                  </p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}