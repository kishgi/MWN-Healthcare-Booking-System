'use client';

import { X, Plus, Save, AlertCircle, ChevronDown } from 'lucide-react';

// Types (you can move these to a shared types file)
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

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
  appointment: Appointment;
  doctors: Doctor[];
  branches: Branch[];
}

export default function EditAppointmentModal({
  isOpen,
  onClose,
  onSave,
  appointment,
  doctors,
  branches
}: EditAppointmentModalProps) {
  if (!isOpen) return null;

  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto text-black">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Appointment</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Doctor Info */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <img
                src={appointment.doctorImage}
                alt={appointment.doctorName}
                className="w-16 h-16 rounded-xl bg-white"
              />
              <div>
                <h3 className="text-lg font-bold text-gray-900">{appointment.doctorName}</h3>
                <p className="text-gray-600">{appointment.doctorSpecialization}</p>
                <p className="text-sm text-gray-500 mt-1">{appointment.branchName}</p>
              </div>
            </div>

            {/* Edit Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={appointment.date}
                  onChange={(e) => onSave({...appointment, date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                />
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot *</label>
                <div className="relative">
                  <select
                    value={appointment.time}
                    onChange={(e) => onSave({...appointment, time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Select a time slot</option>
                    {/* Morning Slots */}
                    <optgroup label="Morning">
                      <option value="08:00 AM" disabled>08:00 AM (Unavailable)</option>
                      <option value="08:30 AM">08:30 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="10:00 AM" disabled>10:00 AM (Unavailable)</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="11:30 AM" disabled>11:30 AM (Unavailable)</option>
                    </optgroup>
                    
                    {/* Afternoon Slots */}
                    <optgroup label="Afternoon">
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="12:30 PM">12:30 PM</option>
                      <option value="01:00 PM" disabled>01:00 PM (Unavailable)</option>
                      <option value="01:30 PM">01:30 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="02:30 PM">02:30 PM</option>
                      <option value="03:00 PM" disabled>03:00 PM (Unavailable)</option>
                      <option value="03:30 PM">03:30 PM</option>
                    </optgroup>
                    
                    {/* Evening Slots */}
                    <optgroup label="Evening">
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="04:30 PM" disabled>04:30 PM (Unavailable)</option>
                      <option value="05:00 PM">05:00 PM</option>
                      <option value="05:30 PM">05:30 PM</option>
                    </optgroup>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                
                {/* Time Slot Legend */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                    <span className="text-gray-600">Unavailable</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
                    <span className="text-gray-600">Current: {appointment.time}</span>
                  </div>
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="relative">
                  <select
                    value={appointment.status}
                    onChange={(e) => onSave({...appointment, status: e.target.value as AppointmentStatus})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent appearance-none bg-white"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="relative">
                  <select
                    value={appointment.type}
                    onChange={(e) => onSave({...appointment, type: e.target.value as AppointmentType})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent appearance-none bg-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <div className="relative">
                  <select
                    value={appointment.duration || '30 minutes'}
                    onChange={(e) => onSave({...appointment, duration: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent appearance-none bg-white"
                  >
                    <option value="15 minutes">15 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                    <option value="60 minutes">60 minutes</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Branch Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                <div className="relative">
                  <select
                    value={appointment.branchName}
                    onChange={(e) => {
                      const selectedBranch = branches.find(b => b.name === e.target.value);
                      if (selectedBranch) {
                        onSave({
                          ...appointment,
                          branchName: selectedBranch.name,
                          branchId: selectedBranch.id
                        });
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Select a branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.name}>{branch.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                <div className="relative">
                  <select
                    value={appointment.doctorName}
                    onChange={(e) => {
                      const selectedDoctor = doctors.find(d => d.name === e.target.value);
                      if (selectedDoctor) {
                        onSave({
                          ...appointment,
                          doctorName: selectedDoctor.name,
                          doctorSpecialization: selectedDoctor.specialization,
                          doctorId: selectedDoctor.id
                        });
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name} ({doctor.specialization})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Reason for Visit */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit *</label>
                <input
                  type="text"
                  value={appointment.reason || ''}
                  onChange={(e) => onSave({...appointment, reason: e.target.value})}
                  placeholder="Enter reason for appointment"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                  required
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={appointment.notes || ''}
                  onChange={(e) => onSave({...appointment, notes: e.target.value})}
                  placeholder="Add any important notes..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                />
              </div>
            </div>

            {/* Symptoms */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
              <p className="text-sm text-gray-600 mb-3">Add any symptoms you're experiencing (optional)</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {appointment.symptoms?.map((symptom, index) => (
                  <div key={index} className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full">
                    <span className="mr-2">{symptom}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newSymptoms = [...(appointment.symptoms || [])];
                        newSymptoms.splice(index, 1);
                        onSave({...appointment, symptoms: newSymptoms});
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  id="newSymptom"
                  placeholder="Add a symptom..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        onSave({
                          ...appointment,
                          symptoms: [...(appointment.symptoms || []), input.value.trim()]
                        });
                        input.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('newSymptom') as HTMLInputElement;
                    if (input.value.trim()) {
                      onSave({
                        ...appointment,
                        symptoms: [...(appointment.symptoms || []), input.value.trim()]
                      });
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </button>
              </div>
            </div>

            {/* Current Appointment Info */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                <h4 className="font-medium text-amber-800">Current Appointment Information</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-amber-700">Current Time</p>
                  <p className="font-semibold text-amber-900">{appointment.time}</p>
                </div>
                <div>
                  <p className="text-amber-700">Token</p>
                  <p className="font-semibold text-amber-900">{appointment.token}</p>
                </div>
                <div>
                  <p className="text-amber-700">Created On</p>
                  <p className="font-semibold text-amber-900">{formatDateForDisplay(appointment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-amber-700">Patient ID</p>
                  <p className="font-semibold text-amber-900">{appointment.patientId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500">
              <span className="flex items-center mr-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                Available time slots are shown normally
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                Unavailable slots are marked and disabled
              </span>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(appointment)}
                className="px-6 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}