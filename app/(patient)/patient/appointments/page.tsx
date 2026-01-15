'use client';

import { useState, useEffect } from 'react';
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
  ChevronDown
} from 'lucide-react';
import Sidebar from '../../../components/PatientSidebar';
import BookAppointmentModal from '../../../components/BookingModal';
import EditAppointmentModal from '../../../components/EditAppointmentModal';

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
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  reason?: string;
  symptoms?: string[];
  duration?: string;
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

export default function AppointmentsPage() {
  // State
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
      reason: 'Routine heart checkup',
      symptoms: ['Chest discomfort', 'Shortness of breath'],
      duration: '30 minutes'
    },
    {
      id: 'app-002',
      patientId: 'patient-123',
      doctorId: 'doc-002',
      doctorName: 'Dr. Michael Chen',
      doctorSpecialization: 'Dermatologist',
      branchId: 'branch-002',
      branchName: 'Downtown Clinic',
      branchCode: 'DTC-02',
      date: '2024-12-10',
      time: '02:00 PM',
      token: 'TK-2024-002',
      status: 'pending',
      type: 'upcoming',
      doctorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      createdAt: '2024-11-28T14:30:00Z',
      patientName: 'John Doe',
      patientPhone: '+1 (555) 123-4567',
      patientEmail: 'john.doe@email.com',
      reason: 'Skin rash consultation',
      symptoms: ['Skin irritation', 'Redness'],
      duration: '30 minutes'
    },
    {
      id: 'app-003',
      patientId: 'patient-123',
      doctorId: 'doc-003',
      doctorName: 'Dr. Emily Williams',
      doctorSpecialization: 'Pediatrician',
      branchId: 'branch-001',
      branchName: 'City Medical Center',
      branchCode: 'CMC-01',
      date: '2024-11-20',
      time: '11:00 AM',
      token: 'TK-2024-003',
      notes: 'Vaccination completed successfully',
      status: 'completed',
      type: 'past',
      doctorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      createdAt: '2024-11-10T09:15:00Z',
      patientName: 'John Doe',
      patientPhone: '+1 (555) 123-4567',
      patientEmail: 'john.doe@email.com',
      reason: 'Child vaccination',
      symptoms: [],
      duration: '15 minutes'
    },
    {
      id: 'app-004',
      patientId: 'patient-123',
      doctorId: 'doc-004',
      doctorName: 'Dr. Robert Davis',
      doctorSpecialization: 'Orthopedic Surgeon',
      branchId: 'branch-003',
      branchName: 'Westside Hospital',
      branchCode: 'WH-03',
      date: '2024-11-15',
      time: '3:30 PM',
      token: 'TK-2024-004',
      notes: 'Patient requested reschedule due to emergency',
      status: 'cancelled',
      type: 'past',
      doctorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
      createdAt: '2024-11-01T16:45:00Z',
      patientName: 'John Doe',
      patientPhone: '+1 (555) 123-4567',
      patientEmail: 'john.doe@email.com',
      reason: 'Knee pain consultation',
      symptoms: ['Joint pain', 'Swelling'],
      duration: '45 minutes'
    },
    {
      id: 'app-005',
      patientId: 'patient-123',
      doctorId: 'doc-005',
      doctorName: 'Dr. Lisa Martinez',
      doctorSpecialization: 'Dentist',
      branchId: 'branch-002',
      branchName: 'Downtown Clinic',
      branchCode: 'DTC-02',
      date: '2024-12-05',
      time: '9:00 AM',
      token: 'TK-2024-005',
      status: 'confirmed',
      type: 'upcoming',
      doctorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
      createdAt: '2024-11-30T11:20:00Z',
      patientName: 'John Doe',
      patientPhone: '+1 (555) 123-4567',
      patientEmail: 'john.doe@email.com',
      reason: 'Dental cleaning',
      symptoms: ['Tooth sensitivity'],
      duration: '25 minutes'
    }
  ]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(appointments);
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: 'doc-001', name: 'Dr. Sarah Johnson', specialization: 'Cardiologist' },
    { id: 'doc-002', name: 'Dr. Michael Chen', specialization: 'Dermatologist' },
    { id: 'doc-003', name: 'Dr. Emily Williams', specialization: 'Pediatrician' },
    { id: 'doc-004', name: 'Dr. Robert Davis', specialization: 'Orthopedic Surgeon' },
    { id: 'doc-005', name: 'Dr. Lisa Martinez', specialization: 'Dentist' },
    { id: 'doc-006', name: 'Dr. David Wilson', specialization: 'Neurologist' },
  ]);
  const [branches, setBranches] = useState<Branch[]>([
    { id: 'branch-001', name: 'City Medical Center' },
    { id: 'branch-002', name: 'Downtown Clinic' },
    { id: 'branch-003', name: 'Westside Hospital' },
    { id: 'branch-004', name: 'North Medical Complex' },
  ]);
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showBookModal, setShowBookModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
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

  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState({
    appointments: false,
    doctors: false,
    branches: false,
  });

  // Patient ID (in real app, get from auth context)
  const patientId = 'patient-123';

  // Apply filters and search
  useEffect(() => {
    if (loading.appointments) return;

    let filtered = appointments.filter(appointment => 
      appointment.type === activeTab
    );

    // Apply filters
    if (filters.branch) {
      filtered = filtered.filter(appointment => appointment.branchName === filters.branch);
    }
    if (filters.doctor) {
      filtered = filtered.filter(appointment => appointment.doctorName === filters.doctor);
    }
    if (filters.status) {
      filtered = filtered.filter(appointment => appointment.status === filters.status);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(appointment =>
        appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.date.includes(searchQuery) ||
        appointment.token.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, activeTab, filters, searchQuery, loading.appointments]);

  // Check for upcoming appointments today
  useEffect(() => {
    if (loading.appointments) return;

    const today = new Date().toISOString().split('T')[0];
    const upcomingToday = appointments.filter(a => 
      a.type === 'upcoming' && a.date === today
    );
    
    if (upcomingToday.length > 0) {
      showNotificationMessage(`You have ${upcomingToday.length} appointment(s) today!`, 'info');
    }
  }, [appointments, loading.appointments]);

  // Appointment Summary
  const upcomingCount = appointments.filter(a => a.type === 'upcoming').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  const showNotificationMessage = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  // Handle successful appointment booking
  const handleAppointmentBooked = (newAppointment: Appointment) => {
    setAppointments([newAppointment, ...appointments]);
    setShowBookModal(false);
    showNotificationMessage('Appointment booked successfully! Confirmation sent to email.', 'success');
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
  const handleSaveEdit = (updatedAppointment: Appointment) => {
    setAppointments(appointments.map(appt => 
      appt.id === updatedAppointment.id ? updatedAppointment : appt
    ));
    setShowEditModal(false);
    setEditingAppointment(null);
    showNotificationMessage('Appointment updated successfully!', 'success');
  };

  // Handle delete appointment
  const handleDeleteAppointment = (appointmentId: string) => {
    setSelectedAppointment(appointments.find(appt => appt.id === appointmentId) || null);
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

  const handleReschedule = async (appointmentId: string, newDate: string, newTime: string) => {
    try {
      setAppointments(appointments.map(appt => 
        appt.id === appointmentId 
          ? { ...appt, date: newDate, time: newTime, status: 'pending' }
          : appt
      ));
      
      showNotificationMessage('Appointment rescheduled successfully!', 'success');
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      showNotificationMessage('Failed to reschedule appointment', 'error');
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      setAppointments(appointments.map(appt => 
        appt.id === appointmentId 
          ? { ...appt, status: 'cancelled', type: 'past' }
          : appt
      ));
      
      showNotificationMessage('Appointment cancelled successfully!', 'success');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      showNotificationMessage('Failed to cancel appointment', 'error');
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
      Branch: ${appointment.branchName}
      Branch Code: ${appointment.branchCode}
      
      Patient Information:
      --------------------
      Patient ID: ${appointment.patientId}
      Name: ${appointment.patientName || 'N/A'}
      
      ${appointment.notes ? `\nNotes:\n${appointment.notes}` : ''}
      
      ====================================
      Booked on: ${formatDateForDisplay(appointment.createdAt)}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MWN-Appointment-${appointment.token}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotificationMessage('Appointment details downloaded!', 'success');
  };

  const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
    const config = {
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const { color, icon: Icon } = config[status];
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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

  // Action buttons component
  const renderActionButtons = (appointment: Appointment) => {
    const isPast = appointment.type === 'past' || appointment.status === 'completed' || appointment.status === 'cancelled';

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
        <button
          onClick={() => handleEditAppointment(appointment)}
          className="flex items-center px-3 py-1.5 text-sm text-amber-600 hover:text-amber-800 transition-colors"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </button>
        <button
          onClick={() => handleDeleteAppointment(appointment.id)}
          className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </button>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
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

  return (
    <div className="min-h-screen bg-gray-50 text-black  overflow-y-auto">
      <Sidebar />
      
      {/* Main Content */}
      <main className="lg:ml-64 lg:pt-6 lg:px-6 transition-all duration-300 ease-in-out text-black">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-gray-600 mt-2">Manage and schedule your medical appointments</p>
              </div>
              <button
                onClick={() => setShowBookModal(true)}
                disabled={loading.doctors || loading.branches}
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
                    <p className="text-sm text-gray-600">Upcoming Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{cancelledCount}</p>
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
                    onChange={(e) => setFilters({...filters, branch: e.target.value})}
                  >
                    <option value="">All Branches</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.name}>{branch.name}</option>
                    ))}
                  </select>

                  <select
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                    value={filters.doctor}
                    onChange={(e) => setFilters({...filters, doctor: e.target.value})}
                  >
                    <option value="">All Doctors</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.name}>{doctor.name}</option>
                    ))}
                  </select>

                  <select
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => setFilters({ branch: '', doctor: '', status: '' })}
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
                    activeTab === 'upcoming'
                      ? 'border-[#0A8F7A] text-[#0A8F7A]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming ({appointments.filter(a => a.type === 'upcoming').length})
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'past'
                      ? 'border-[#0A8F7A] text-[#0A8F7A]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('past')}
                >
                  Past ({appointments.filter(a => a.type === 'past').length})
                </button>
              </div>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || Object.values(filters).some(f => f) 
                      ? 'Try adjusting your filters' 
                      : 'You have no appointments yet'}
                  </p>
                  <button
                    onClick={() => setShowBookModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    <CalendarPlus className="w-5 h-5 mr-2" />
                    Book Your First Appointment
                  </button>
                </div>
              ) : (
                filteredAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Doctor Info */}
                        <div className="flex items-start space-x-4">
                          <img
                            src={appointment.doctorImage}
                            alt={appointment.doctorName}
                            className="w-16 h-16 rounded-xl bg-gray-100"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
                            <p className="text-gray-600">{appointment.doctorSpecialization}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                              <span className="inline-flex items-center text-sm text-gray-500">
                                <MapPin className="w-4 h-4 mr-1" />
                                {appointment.branchName}
                              </span>
                              <span className="inline-flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDateForDisplay(appointment.date)}
                              </span>
                              <span className="inline-flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
                                {appointment.time}
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

                      {/* Additional Notes */}
                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-start">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-sm text-amber-800">{appointment.notes}</p>
                          </div>
                        </div>
                      )}
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
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border ${
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

      {/* Book Appointment Modal */}
      {showBookModal && (
        <BookAppointmentModal
          isOpen={showBookModal}
          onClose={() => setShowBookModal(false)}
          onAppointmentBooked={handleAppointmentBooked}
          patientId={patientId}
        />
      )}

      {/* View Appointment Modal */}
      {showViewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
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
                    src={selectedAppointment.doctorImage}
                    alt={selectedAppointment.doctorName}
                    className="w-20 h-20 rounded-xl bg-white"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedAppointment.doctorName}</h3>
                    <p className="text-gray-600">{selectedAppointment.doctorSpecialization}</p>
                    <StatusBadge status={selectedAppointment.status} />
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Token Number</label>
                      <p className="text-lg font-semibold text-gray-900 font-mono">{selectedAppointment.token}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Date</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDateForDisplay(selectedAppointment.date)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Branch Location</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedAppointment.branchName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Appointment Reason</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedAppointment.reason || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Time Slot</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedAppointment.time}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Duration</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedAppointment.duration || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <StatusBadge status={selectedAppointment.status} />
                    </div>
                  </div>
                </div>

                {/* Branch Code */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Branch Information</p>
                      <p className="text-sm text-blue-700 mt-1">Branch Code: {selectedAppointment.branchCode}</p>
                    </div>
                  </div>
                </div>

                {/* Symptoms */}
                {selectedAppointment.symptoms && selectedAppointment.symptoms.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-3">Reported Symptoms</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAppointment.symptoms.map((symptom, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Important Notes */}
                {selectedAppointment.notes && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-2">Important Notes</h4>
                    <p className="text-amber-700">{selectedAppointment.notes}</p>
                  </div>
                )}

                {/* Patient Information */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3">Patient Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-green-700">Name</p>
                      <p className="font-semibold text-green-900">{selectedAppointment.patientName || 'John Doe'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Email</p>
                      <p className="font-semibold text-green-900">{selectedAppointment.patientEmail || 'john.doe@email.com'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Phone</p>
                      <p className="font-semibold text-green-900">{selectedAppointment.patientPhone || '+1 (555) 123-4567'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Patient ID</p>
                      <p className="font-semibold text-green-900">{selectedAppointment.patientId}</p>
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
                {selectedAppointment.status !== 'cancelled' && selectedAppointment.type === 'upcoming' && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setTimeout(() => handleEditAppointment(selectedAppointment), 100);
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
          doctors={doctors}
          branches={branches}
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
              
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Appointment</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this appointment? This action cannot be undone.
              </p>

              <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
                <div className="text-center">
                  <p className="font-medium text-red-800 mb-1">{selectedAppointment.doctorName}</p>
                  <p className="text-sm text-red-700">{selectedAppointment.doctorSpecialization}</p>
                  <p className="text-sm text-red-600 mt-1">
                    {formatDateForDisplay(selectedAppointment.date)} at {selectedAppointment.time}
                  </p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
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