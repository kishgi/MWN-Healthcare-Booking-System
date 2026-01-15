'use client';

import { useState } from 'react';
import Sidebar from '../../../components/PatientSidebar';
import { 
  Bell, 
  Search, 
  Plus, 
  FileText, 
  CreditCard, 
  Calendar, 
  MapPin, 
  MessageSquare,
  ArrowRight,
  Download,
  ChevronRight,
  Phone,
  Eye,
  DollarSign,
  Clock,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import BookAppointmentModal from '../../../components/BookingModal';
import EditAppointmentModal from '../../../components/EditAppointmentModal';

// Types (matching your appointments page types)
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

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [showBookModal, setShowBookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Sample data for the upcoming appointment
  const [upcomingAppointment] = useState<Appointment>({
    id: 'app-001',
    patientId: 'patient-123',
    doctorId: 'doc-001',
    doctorName: 'Dr. Sarah Johnson',
    doctorSpecialization: 'Cardiologist',
    branchId: 'branch-001',
    branchName: 'Main Hospital, Downtown',
    branchCode: 'T-78945',
    date: new Date().toISOString().split('T')[0], // Today's date
    time: '10:30 AM',
    token: 'T-78945',
    notes: 'Please arrive 15 minutes early for paperwork',
    status: 'confirmed',
    type: 'upcoming',
    doctorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    createdAt: '2024-12-10T10:00:00Z',
    patientName: 'John Doe',
    patientPhone: '+1 (555) 123-4567',
    patientEmail: 'john.doe@email.com',
    reason: 'Routine heart checkup',
    symptoms: ['Chest discomfort', 'Shortness of breath'],
    duration: '30 minutes'
  });

  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Sample doctors and branches data
  const [doctors] = useState<Doctor[]>([
    { id: 'doc-001', name: 'Dr. Sarah Johnson', specialization: 'Cardiologist' },
    { id: 'doc-002', name: 'Dr. Michael Chen', specialization: 'Dermatologist' },
    { id: 'doc-003', name: 'Dr. Emily Williams', specialization: 'Pediatrician' },
    { id: 'doc-004', name: 'Dr. Robert Davis', specialization: 'Orthopedic Surgeon' },
    { id: 'doc-005', name: 'Dr. Lisa Martinez', specialization: 'Dentist' },
    { id: 'doc-006', name: 'Dr. David Wilson', specialization: 'Neurologist' },
  ]);

  const [branches] = useState<Branch[]>([
    { id: 'branch-001', name: 'Main Hospital, Downtown' },
    { id: 'branch-002', name: 'Downtown Clinic' },
    { id: 'branch-003', name: 'Westside Hospital' },
    { id: 'branch-004', name: 'North Medical Complex' },
  ]);

  // Patient ID (in real app, get from auth context)
  const patientId = 'patient-123';

  // Handle book new appointment
  const handleBookAppointment = () => {
    setShowBookModal(true);
  };

  // Handle reschedule appointment
  const handleRescheduleAppointment = () => {
    setEditingAppointment({ ...upcomingAppointment });
    setShowEditModal(true);
  };

  // Handle appointment booked (from BookAppointmentModal)
  const handleAppointmentBooked = (newAppointment: Appointment) => {
    // In a real app, you would update the state with the new appointment
    console.log('New appointment booked:', newAppointment);
    setShowBookModal(false);
    // Show success notification
    alert('Appointment booked successfully!');
  };

  // Handle save edited appointment (from EditAppointmentModal)
  const handleSaveEdit = (updatedAppointment: Appointment) => {
    // In a real app, you would update the appointment in your state
    console.log('Appointment updated:', updatedAppointment);
    setShowEditModal(false);
    setEditingAppointment(null);
    // Show success notification
    alert('Appointment rescheduled successfully!');
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingAppointment(null);
  };

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
                <button title='Notify' className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors group">
                  <Bell className="h-5 w-5 text-gray-600 group-hover:text-[#0A8F7A]" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
              </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] flex items-center justify-center">
                  <span className="text-white font-bold">JD</span>
                </div>
                <div className="hidden md:block">
                  <div className="font-medium text-gray-900">John Doe</div>
                  <div className="text-sm text-gray-600">Patient ID: #P-78945</div>
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h1>
                <p className="text-gray-600">Here's what's happening with your health today</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-sm font-medium rounded-full">
                  Member since 2022
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 text-sm font-medium rounded-full">
                  Premium Patient
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
                  <div className="text-3xl font-bold text-gray-900">3</div>
                  <div className="text-xs text-gray-500">+1 this week</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">Upcoming Appointments</div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>

            {/* Active Packages Stat */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">2</div>
                  <div className="text-xs text-gray-500">1 expiring soon</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">Active Packages</div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                  style={{ width: '40%' }}
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
                  <div className="text-3xl font-bold text-gray-900">$245</div>
                  <div className="text-xs text-gray-500">Due in 3 days</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">Pending Bills</div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  style={{ width: '75%' }}
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
                  <div className="text-3xl font-bold text-gray-900">2</div>
                  <div className="text-xs text-gray-500">From medical staff</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">Unread Messages</div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: '20%' }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Upcoming Appointments Widget */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
                  <Link href="/patient/appointments" className="text-sm text-[#0A8F7A] hover:text-[#0A8F7A]/80 font-medium flex items-center">
                    View all
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {/* Single Appointment Card */}
                <div className="p-4 rounded-xl border border-gray-100 hover:border-[#0A8F7A]/30 hover:shadow-sm transition-all duration-200 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                        <span className="font-bold text-blue-700">SJ</span>
                      </div>
                      <div>
                        {/* Doctor / Consultant name */}
                        <div className="font-bold text-gray-900">{upcomingAppointment.doctorName}</div>
                        {/* Specialty */}
                        <div className="text-sm text-gray-600">{upcomingAppointment.doctorSpecialization}</div>
                        {/* Branch location */}
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {upcomingAppointment.branchName}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {/* Status (Confirmed / Pending / Cancelled) */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${
                        upcomingAppointment.status === 'confirmed' ? 'bg-green-500' :
                        upcomingAppointment.status === 'pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}>
                        {upcomingAppointment.status.charAt(0).toUpperCase() + upcomingAppointment.status.slice(1)}
                      </span>
                      {/* Date & Time */}
                      <div className="text-sm text-gray-900 font-medium mt-2">Today, Dec 15</div>
                      <div className="text-sm text-gray-600">{upcomingAppointment.time}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    {/* Appointment token number */}
                    <div className="text-sm">
                      <span className="text-gray-600">Token:</span>
                      <span className="font-medium text-gray-900 ml-2">{upcomingAppointment.token}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-black px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Phone className="h-3 w-3 inline mr-1" />
                        Call
                      </button>
                      <button 
                        onClick={handleRescheduleAppointment}
                        className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-lg hover:shadow-md transition-shadow"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleBookAppointment}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-200 group"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book New Appointment
                </button>
              </div>
            </div>

            {/* Active Wellness Packages Widget */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Active Wellness Packages</h2>
                  <Link href="/patient/wellness" className="text-sm text-[#0A8F7A] hover:text-[#0A8F7A]/80 font-medium flex items-center">
                    View all
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {/* Single Package Card */}
                <div className="p-4 rounded-xl border border-gray-100 hover:border-[#0A8F7A]/30 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {/* Package name */}
                      <div className="font-bold text-gray-900">Nutrition & Diet</div>
                      {/* Description */}
                      <div className="text-sm text-gray-600 mt-1">Personalized nutrition plan and weekly consultations</div>
                    </div>
                    <div className="text-right">
                      {/* Expiry date */}
                      <div className="text-sm text-gray-600">Expires</div>
                      <div className="font-medium text-gray-900">Mar 15, 2025</div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    {/* Sessions completed / total sessions */}
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Sessions completed</span>
                      <span className="font-medium text-gray-900">
                        5 / 12
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                        style={{ width: '42%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-sm">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium text-gray-900 ml-2">42%</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-black px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
                
                <Link href="/patient/wellness/browse" className="mt-6 w-full py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-200 group">
                  <Plus className="h-4 w-4 mr-2" />
                  Explore More Packages
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Notifications Widget */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Notifications & Alerts</h2>
                <Link href="/patient/notifications" className="text-sm text-[#0A8F7A] hover:text-[#0A8F7A]/80 font-medium flex items-center">
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {/* Single Notification Card */}
              <div className="p-4 rounded-xl border border-[#0A8F7A]/20 bg-gradient-to-r from-[#D6F4ED]/20 to-[#C0F0E5]/20 hover:shadow-sm transition-all duration-200 group">
                <div className="flex items-start space-x-4">
                  {/* Notification Type Icon */}
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        {/* Title */}
                        <div className="font-medium text-gray-900 flex items-center">
                          Appointment Reminder
                          <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </div>
                        {/* Message */}
                        <p className="text-gray-600 mt-1">Your appointment with {upcomingAppointment.doctorName} is in 2 hours</p>
                      </div>
                      {/* Time */}
                      <div className="text-sm text-gray-500 whitespace-nowrap ml-4">
                        30 min ago
                      </div>
                    </div>
                    
                    {/* Actions based on notification type */}
                    <div className="mt-3 flex space-x-2">
                      <button className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-lg hover:shadow-md transition-shadow">
                        View Details
                      </button>
                      <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional notification types can be added here */}
              <div className="mt-4 text-sm text-gray-500">
                Includes: Upcoming appointment reminders, Billing alerts, Messages from clinic staff
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      
      {/* Book Appointment Modal */}
      {showBookModal && (
        <BookAppointmentModal
          isOpen={showBookModal}
          onClose={() => setShowBookModal(false)}
          onAppointmentBooked={handleAppointmentBooked}
          patientId={patientId}
        />
      )}

      {/* Edit Appointment Modal (for Reschedule) */}
      {showEditModal && editingAppointment && (
        <EditAppointmentModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleSaveEdit}
          appointment={editingAppointment}
          doctors={doctors}
          branches={branches}
        />
      )}
    </div>
  );
}