'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../../components/StaffSidebar';
import EditAppointmentModal from '../../../components/EditAppointmentModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  Search, 
  Filter, 
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
  ChevronDown,
  ChevronUp,
  Filter as FilterIcon,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  User as UserIcon
} from 'lucide-react';

// Types
type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
type AppointmentType = 'upcoming' | 'past';

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  branchId: string;
  branchName: string;
  branchCode: string;
  date: string;
  time: string;
  token: string;
  notes?: string;
  status: AppointmentStatus;
  type: AppointmentType;
  doctorImage: string;
  createdAt: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  reason?: string;
  symptoms?: string[];
  duration?: string;
  patientAge?: number;
  patientGender?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface Branch {
  id: string;
  name: string;
}

interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  age?: number;
  gender?: string;
}

export default function AppointmentsPage() {
  // State
  const [currentPatient, setCurrentPatient] = useState<Patient>({
    id: 'patient-123',
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    email: 'john.doe@email.com',
    age: 35,
    gender: 'Male'
  });
  
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'app-001',
      patientId: 'patient-123',
      doctorId: 'doc-001',
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialization: 'Cardiologist',
      branchId: 'branch-001',
      branchName: 'City Medical Center',
      branchCode: 'CMC-01',
      date: '2024-12-15',
      time: '10:30 AM',
      token: 'TK-2024-001',
      notes: 'Please arrive 15 minutes early for paperwork',
      status: 'confirmed',
      type: 'upcoming',
      doctorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      createdAt: '2024-11-25T10:00:00Z',
      patientName: 'John Doe',
      patientPhone: '+1 (555) 123-4567',
      patientEmail: 'john.doe@email.com',
      patientAge: 35,
      patientGender: 'Male',
      reason: 'Routine heart checkup',
      symptoms: ['Chest discomfort', 'Shortness of breath'],
      duration: '30 minutes'
    },
    
  ]);
  
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: 'doc-001', name: 'Dr. Sarah Johnson', specialization: 'Cardiologist' },
    { id: 'doc-002', name: 'Dr. Michael Chen', specialization: 'Dermatologist' },
    { id: 'doc-003', name: 'Dr. Emily Rodriguez', specialization: 'Pediatrician' },
    { id: 'doc-004', name: 'Dr. Robert Wilson', specialization: 'Orthopedic' },
  ]);
  
  const [branches, setBranches] = useState<Branch[]>([
    { id: 'branch-001', name: 'City Medical Center' },
    { id: 'branch-002', name: 'Downtown Clinic' },
    { id: 'branch-003', name: 'Westside Hospital' },
    { id: 'branch-004', name: 'North Medical Complex' },
  ]);
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    branch: '',
    doctor: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Apply filters and search
  const filteredAppointments = appointments
    .filter(appointment => {
      // Active tab filter
      if (appointment.type !== activeTab) return false;
      
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          appointment.doctorName.toLowerCase().includes(searchLower) ||
          appointment.branchName.toLowerCase().includes(searchLower) ||
          appointment.date.includes(searchQuery) ||
          appointment.token.toLowerCase().includes(searchLower) ||
          appointment.reason?.toLowerCase().includes(searchLower) ||
          appointment.patientName.toLowerCase().includes(searchLower); // Added patient name search
        if (!matchesSearch) return false;
      }
      
      // Branch filter
      if (filters.branch && appointment.branchName !== filters.branch) return false;
      
      // Doctor filter
      if (filters.doctor && appointment.doctorName !== filters.doctor) return false;
      
      // Status filter
      if (filters.status && appointment.status !== filters.status) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      const { key, direction } = sortConfig;
      let aValue: any = a[key as keyof Appointment];
      let bValue: any = b[key as keyof Appointment];
      
      // Handle date sorting
      if (key === 'date' || key === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      // Handle time sorting (convert to minutes)
      if (key === 'time') {
        aValue = convertTimeToMinutes(aValue);
        bValue = convertTimeToMinutes(bValue);
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
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  // Helper function to convert time to minutes for sorting
  const convertTimeToMinutes = (timeStr: string): number => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

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

  // Show notification
  const showNotificationMessage = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  // Handle edit appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment({ ...appointment });
    setShowEditModal(true);
  };

  // Handle save edited appointment
  const handleSaveEdit = (updatedAppointment: Appointment) => {
    setAppointments(appointments.map(appt => 
      appt.id === updatedAppointment.id ? updatedAppointment : appt
    ));
    setShowEditModal(false);
    setEditingAppointment(null);
    showNotificationMessage('Appointment updated successfully!', 'success');
  };

  // Handle delete appointment
  const handleDeleteAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  // Confirm delete appointment
  const handleConfirmDelete = () => {
    if (selectedAppointment) {
      setAppointments(appointments.filter(appt => appt.id !== selectedAppointment.id));
      setShowDeleteModal(false);
      setSelectedAppointment(null);
      showNotificationMessage('Appointment deleted successfully!', 'success');
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Status Badge component
  const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
    const config = {
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
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

  // Appointment Summary
  const upcomingCount = appointments.filter(a => a.type === 'upcoming').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;
  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  // Get patient info for display
  const getPatientInfo = () => {
    return `${currentPatient.name}${currentPatient.age ? `, ${currentPatient.age}` : ''}${currentPatient.gender ? `, ${currentPatient.gender}` : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Sidebar />
      
      {/* Main Content */}
      <main className="lg:ml-64 lg:pt-6 lg:px-6 transition-all duration-300 ease-in-out text-black">
        <div className="max-w-7xl mx-auto">
          {/* Header with Patient Info */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center mb-2">
                  <UserIcon className="w-6 h-6 text-[#0A8F7A] mr-2" />
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Appointments</h1>
                </div>
                
                <p className="text-gray-600 mt-2">Manage and view all your medical appointments</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200">
                  <CalendarPlus className="w-5 h-5 mr-2" />
                  New Appointment
                </button>
              </div>
            </div>

            {/* Appointment Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Upcoming</p>
                    <p className="text-lg font-bold text-gray-900">{upcomingCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-lg font-bold text-gray-900">{completedCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <ClockIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-lg font-bold text-gray-900">{pendingCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-red-100">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-lg font-bold text-gray-900">{cancelledCount}</p>
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
                      placeholder="Search by patient name, doctor, branch, date, token, or reason..."
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
                    setFilters({ branch: '', doctor: '', status: '' });
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
                      value={filters.branch}
                      onChange={(e) => {
                        setFilters({...filters, branch: e.target.value});
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Branches</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.name}>{branch.name}</option>
                      ))}
                    </select>

                    <select
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={filters.doctor}
                      onChange={(e) => {
                        setFilters({...filters, doctor: e.target.value});
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Doctors</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.name}>{doctor.name}</option>
                      ))}
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
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex space-x-2 border-b border-gray-200">
                <button
                  className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'upcoming'
                      ? 'border-[#0A8F7A] text-[#0A8F7A]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => {
                    setActiveTab('upcoming');
                    setCurrentPage(1);
                  }}
                >
                  Upcoming ({appointments.filter(a => a.type === 'upcoming').length})
                </button>
                <button
                  className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'past'
                      ? 'border-[#0A8F7A] text-[#0A8F7A]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => {
                    setActiveTab('past');
                    setCurrentPage(1);
                  }}
                >
                  Past ({appointments.filter(a => a.type === 'past').length})
                </button>
              </div>
            </div>

            {/* Table View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Info
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('doctorName')}
                      >
                        <div className="flex items-center">
                          Doctor
                          {sortConfig?.key === 'doctorName' && (
                            sortConfig.direction === 'asc' ? 
                            <ChevronUp className="w-4 h-4 ml-1" /> : 
                            <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center">
                          Date & Time
                          {sortConfig?.key === 'date' && (
                            sortConfig.direction === 'asc' ? 
                            <ChevronUp className="w-4 h-4 ml-1" /> : 
                            <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
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
                    {currentAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                          <p className="text-gray-600 mb-4">
                            {searchQuery || Object.values(filters).some(f => f) 
                              ? 'Try adjusting your filters' 
                              : `You have no ${activeTab} appointments`}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      currentAppointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                          {/* Patient Info Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <UserIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                                {appointment.patientAge && appointment.patientGender && (
                                  <div className="text-xs text-gray-500">
                                    {appointment.patientAge} yrs, {appointment.patientGender}
                                  </div>
                                )}
                                {appointment.patientPhone && (
                                  <div className="text-xs text-gray-500 flex items-center mt-1">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {appointment.patientPhone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          {/* Doctor Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={appointment.doctorImage}
                                alt={appointment.doctorName}
                                className="w-10 h-10 rounded-lg bg-gray-100"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{appointment.doctorName}</div>
                                <div className="text-sm text-gray-500">{appointment.doctorSpecialization}</div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Date & Time Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{formatDateForDisplay(appointment.date)}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {appointment.time}
                              </div>
                            </div>
                          </td>
                          
                          {/* Branch Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.branchName}</div>
                            <div className="text-xs text-gray-500">{appointment.branchCode}</div>
                          </td>
                          
                          {/* Reason Column */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{appointment.reason || 'Not specified'}</div>
                            {appointment.symptoms && appointment.symptoms.length > 0 && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                Symptoms: {appointment.symptoms.join(', ')}
                              </div>
                            )}
                          </td>
                          
                          {/* Status Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={appointment.status} />
                            <div className="text-xs text-gray-500 mt-1">Token: {appointment.token}</div>
                          </td>
                          
                          {/* Actions Column */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {appointment.type === 'upcoming' && appointment.status !== 'cancelled' ? (
                                <>
                                  <button
                                    onClick={() => handleEditAppointment(appointment)}
                                    className="inline-flex items-center px-3 py-1.5 text-sm bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                                    title="Edit/Reschedule"
                                  >
                                    <Edit className="w-3.5 h-3.5 mr-1" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAppointment(appointment)}
                                    className="inline-flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    Delete
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => alert('Viewing details for past appointment')}
                                  className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-1" />
                                  View
                                </button>
                              )}
                              
                              <button className="inline-flex items-center p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                <MoreVertical className="w-4 h-4" />
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
              {filteredAppointments.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredAppointments.length)}</span> of{' '}
                    <span className="font-medium">{filteredAppointments.length}</span> appointments
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

      {/* Notification */}
      {showNotification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
          notification.type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-800'
            : notification.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            <p>{notification.message}</p>
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
          doctors={doctors}
          branches={branches}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Appointment</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this appointment? This action cannot be undone.
              </p>

              <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <UserIcon className="w-4 h-4 text-red-700 mr-2" />
                    <p className="font-medium text-red-800">{selectedAppointment.patientName}</p>
                  </div>
                  <p className="font-medium text-red-800 mb-1">{selectedAppointment.doctorName}</p>
                  <p className="text-sm text-red-700">{selectedAppointment.doctorSpecialization}</p>
                  <p className="text-sm text-red-600 mt-1">
                    {formatDateForDisplay(selectedAppointment.date)} at {selectedAppointment.time}
                  </p>
                  <p className="text-xs text-red-500 mt-1">Token: {selectedAppointment.token}</p>
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
                  Delete Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}