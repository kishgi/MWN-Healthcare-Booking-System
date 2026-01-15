'use client';

import { useState } from 'react';
import StaffSidebar from '../../../components/StaffSidebar';
import { 
  Calendar, 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Filter,
  Download,
  ChevronRight,
  Bell,
  User,
  Activity,
  PieChart,
  FileText,
  MessageSquare
} from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  time: string;
  type: string;
  doctor: string;
  status: 'confirmed' | 'waiting' | 'completed' | 'cancelled';
}

interface Token {
  id: string;
  number: string;
  patientName: string;
  waitingTime: string;
  department: string;
  priority: 'normal' | 'urgent';
}

const StaffDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Today's Appointments Data
  const todaysAppointments: Appointment[] = [
    { id: '1', patientName: 'John Smith', patientId: 'P-00123', time: '09:00 AM', type: 'Consultation', doctor: 'Dr. Sarah Johnson', status: 'confirmed' },
    
  ];

  // Waiting List / Tokens
  const waitingTokens: Token[] = [
    { id: '1', number: 'T-101', patientName: 'James Wilson', waitingTime: '15 mins', department: 'General', priority: 'normal' },
  
  ];

  // Quick Stats Data
  const quickStats = {
    totalPatients: 156,
    patientsToday: 24,
    pendingBills: 18,
    totalRevenue: 12540,
    completedAppointments: 189,
    cancelledAppointments: 7
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'waiting': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const filteredAppointments = todaysAppointments.filter(appointment => {
    if (filterType === 'all') return true;
    return appointment.status === filterType;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <StaffSidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content Area */}
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="text-gray-600">Welcome back, John! Here's what's happening today.</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patients, appointments..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                  JD
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Patients Today */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Patients Today</p>
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold text-gray-900">{quickStats.patientsToday}</p>
                      <span className="ml-2 text-sm text-green-600 font-medium">+12%</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Out of {quickStats.totalPatients} total patients</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Pending Bills */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Bills</p>
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold text-gray-900">{quickStats.pendingBills}</p>
                      <span className="ml-2 text-sm text-amber-600 font-medium">Needs attention</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Total outstanding</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold text-gray-900">${quickStats.totalRevenue.toLocaleString()}</p>
                      <span className="ml-2 text-sm text-green-600 font-medium">+8.5%</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">This month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Appointments Status */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Appointments</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="font-medium">{quickStats.completedAppointments}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cancelled</span>
                        <span className="font-medium text-red-600">{quickStats.cancelledAppointments}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Today's Appointments Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Today's Appointments
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">{todaysAppointments.length} appointments scheduled</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select 
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="waiting">Waiting</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{appointment.patientName}</div>
                              <div className="text-sm text-gray-500">{appointment.patientId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.time}</div>
                            <div className="text-sm text-gray-500">{appointment.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.doctor}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1">{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                            <button className="text-gray-600 hover:text-gray-800">Check-in</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      View All Appointments →
                    </button>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        Export
                      </button>
                      {/* <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                        Add Appointment
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Waiting List / Tokens Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Waiting List / Tokens
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">{waitingTokens.length} patients waiting</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Filter className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {waitingTokens.map((token) => (
                    <div key={token.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mr-4">
                            <span className="text-2xl font-bold text-blue-600">{token.number}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{token.patientName}</div>
                            <div className="flex items-center mt-1 space-x-4">
                              <span className="text-sm text-gray-600 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {token.waitingTime}
                              </span>
                              <span className="text-sm text-gray-600">{token.department}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(token.priority)}`}>
                            {token.priority === 'urgent' ? (
                              <AlertCircle className="w-3 h-3 mr-1" />
                            ) : null}
                            {token.priority.charAt(0).toUpperCase() + token.priority.slice(1)}
                          </span>
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      Manage Waiting List →
                    </button>
                    <div className="flex items-center space-x-2">
                      {/* <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </button>
                      <button className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Add Patient
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Actions Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="font-medium">Create New Appointment</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="font-medium">Generate Invoice</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="font-medium">Patient Check-in</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="font-medium">View Reports</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Patient check-in completed</p>
                      <p className="text-xs text-gray-500">John Smith • 9:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New appointment booked</p>
                      <p className="text-xs text-gray-500">Emma Wilson • 10:15 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payment overdue</p>
                      <p className="text-xs text-gray-500">Robert Davis • Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Summary */}
              <div className="bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-4">Today's Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span>Appointments</span>
                    <span className="font-bold">{todaysAppointments.length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span>Patients Waiting</span>
                    <span className="font-bold">{waitingTokens.length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span>Pending Bills</span>
                    <span className="font-bold">{quickStats.pendingBills}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Revenue Today</span>
                    <span className="font-bold">$1,240</span>
                  </div>
                </div>
                <button className="w-full mt-6 py-2.5 bg-white text-[#0A8F7A] font-medium rounded-lg hover:bg-gray-100 transition-colors">
                  View Full Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;