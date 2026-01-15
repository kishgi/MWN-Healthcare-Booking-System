'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, 
  User, 
  CheckCircle,
  X,
  Loader2,
  Calendar,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building,
  Navigation,
  Phone as PhoneIcon,
  Clock as ClockIcon,
  ChevronRight as RightArrow,
  Ban
} from 'lucide-react';

// Types
interface Doctor {
  id: string;
  name: string;
  specialization: string;
  branchId: string;
  availableDays: string[]; // Array of days like ['Monday', 'Wednesday', 'Friday']
  availableHours: {
    start: string;
    end: string;
  };
  unavailableDates?: string[]; // Specific dates when doctor is unavailable
}

interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  phone: string;
  operatingHours: string;
  facilities: string[];
  description?: string;
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isPeakHour: boolean;
}

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentBooked: (appointment: any) => void;
  patientId: string;
}

// Sample branch data
const sampleBranches: Branch[] = [
  {
    id: 'branch-1',
    name: 'Colombo Main Hospital',
    code: 'CLB',
    location: '123 Galle Road, Colombo 03',
    phone: '+94 11 234 5678',
    operatingHours: 'Mon-Sun: 6:00 AM - 10:00 PM',
    facilities: ['Emergency Care', 'Wellness Center', 'Pharmacy', 'Lab Services'],
  },
  {
    id: 'branch-2',
    name: 'Kandy Wellness Center',
    code: 'KDY',
    location: '45 Dalada Veediya, Kandy',
    phone: '+94 81 234 5678',
    operatingHours: 'Mon-Sat: 7:00 AM - 8:00 PM, Sun: 8:00 AM - 6:00 PM',
    facilities: ['Wellness Programs', 'Nutrition Counseling', 'Fitness Center'],
  },
  {
    id: 'branch-3',
    name: 'Galle Coastal Clinic',
    code: 'GLE',
    location: '78 Hospital Street, Galle Fort',
    phone: '+94 91 234 5678',
    operatingHours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 8:00 AM - 1:00 PM',
    facilities: ['General Medicine', 'Pediatrics', 'Women\'s Health'],
  },
  {
    id: 'branch-4',
    name: 'Negombo City Clinic',
    code: 'NEG',
    location: '22 Poruthota Road, Negombo',
    phone: '+94 31 234 5678',
    operatingHours: 'Mon-Sun: 24/7 Emergency',
    facilities: ['24/7 Emergency', 'ICU', 'Surgery', 'Radiology'],
  },
];

export default function BookAppointmentModal({
  isOpen,
  onClose,
  onAppointmentBooked,
  patientId,
}: BookAppointmentModalProps) {
  // Form state
  const [step, setStep] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    sms: true,
  });
  
  // Data state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState({
    branches: false,
    doctors: false,
    timeSlots: false,
  });
  const [isBooking, setIsBooking] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // Fetch initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen]);

  // Fetch branches
  const fetchBranches = async () => {
    setLoading(prev => ({ ...prev, branches: true }));
    try {
      // TODO: Replace with your API call
      // const response = await fetch('/api/branches');
      // const data = await response.json();
      // setBranches(data);
      
      setBranches(sampleBranches);
      
      // Generate next 30 days for date selection
      const dates = generateAvailableDates(30);
      setAvailableDates(dates);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setValidationError('Failed to load branches. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, branches: false }));
    }
  };

  // Fetch doctors for selected branch
  const fetchDoctorsForBranch = async (branchId: string) => {
    setLoading(prev => ({ ...prev, doctors: true }));
    try {
      // TODO: Replace with your API call
      // const response = await fetch(`/api/doctors?branchId=${branchId}`);
      // const data = await response.json();
      // setAvailableDoctors(data);
      
      // Sample doctors data with unavailable dates
      const sampleDoctors: Doctor[] = [
        { 
          id: 'doc-1', 
          name: 'Dr. Sarah Johnson', 
          specialization: 'Wellness & Nutrition',
          branchId: branchId,
          availableDays: ['Monday', 'Wednesday', 'Friday'],
          availableHours: { start: '08:00', end: '17:00' },
          unavailableDates: ['2024-12-20', '2024-12-25', '2024-12-31'] // Sample unavailable dates
        },
        { 
          id: 'doc-2', 
          name: 'Dr. Michael Chen', 
          specialization: 'Fitness & Rehabilitation',
          branchId: branchId,
          availableDays: ['Tuesday', 'Thursday', 'Saturday'],
          availableHours: { start: '09:00', end: '18:00' },
          unavailableDates: ['2024-12-24', '2024-12-26', '2025-01-01']
        },
        { 
          id: 'doc-3', 
          name: 'Dr. Emily Rodriguez', 
          specialization: 'General Medicine',
          branchId: branchId,
          availableDays: ['Monday', 'Tuesday', 'Friday'],
          availableHours: { start: '08:00', end: '16:00' },
          unavailableDates: ['2024-12-23', '2024-12-30']
        },
      ];
      
      setAvailableDoctors(sampleDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setValidationError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, doctors: false }));
    }
  };

  // Fetch time slots for selected doctor and date - UPDATED
  const fetchTimeSlots = async (doctorId: string, date: string) => {
    setLoading(prev => ({ ...prev, timeSlots: true }));
    try {
      // Check if doctor is available on this date
      const doctor = availableDoctors.find(d => d.id === doctorId);
      if (!doctor) {
        setTimeSlots([]);
        return;
      }
      
      // Check if doctor is available on this specific day of week
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if doctor works on this day
      if (!doctor.availableDays.includes(dayOfWeek)) {
        setTimeSlots([]);
        return;
      }
      
      // Check if doctor has specific unavailability on this date
      if (doctor.unavailableDates?.includes(date)) {
        setTimeSlots([]);
        return;
      }
      
      // TODO: Replace with your API call for real time slots
      // const response = await fetch(`/api/availability?doctorId=${doctorId}&date=${date}`);
      // const data = await response.json();
      // setTimeSlots(data);
      
      // Generate sample time slots only if doctor is available
      const slots = generateTimeSlots(doctorId, date);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setValidationError('Failed to load available time slots.');
    } finally {
      setLoading(prev => ({ ...prev, timeSlots: false }));
    }
  };

  // Generate sample time slots
  const generateTimeSlots = (doctorId: string, date: string): TimeSlot[] => {
    const doctor = availableDoctors.find(d => d.id === doctorId);
    if (!doctor) return [];

    const slots: TimeSlot[] = [];
    const { start, end } = doctor.availableHours;
    
    // Convert start and end times to minutes
    const startMinutes = convertTimeToMinutes(start);
    const endMinutes = convertTimeToMinutes(end);
    const slotDuration = 30; // minutes
    
    // Generate slots from start to end time
    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
      const time24 = convertMinutesToTime(minutes);
      const time12 = convertTo12HourFormat(time24);
      
      // Randomly mark some slots as unavailable (simulating booked slots)
      const isAvailable = Math.random() > 0.2; // 80% chance of being available
      const hour = Math.floor(minutes / 60);
      const isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16); // Peak hours 9-11 AM, 2-4 PM
      
      slots.push({
        time: time12,
        isAvailable,
        isPeakHour
      });
    }
    
    return slots;
  };

  // Helper function to convert time string to minutes
  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to convert minutes to time string
  const convertMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Helper function to convert 24-hour format to 12-hour format
  const convertTo12HourFormat = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Generate available dates - UPDATED to check doctor availability
  const generateAvailableDates = (daysAhead: number): string[] => {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      dates.push(dateString);
    }
    
    return dates;
  };

  // Get filtered available dates based on selected doctor
  const getFilteredAvailableDates = (): string[] => {
    if (!selectedDoctor) return availableDates;

    return availableDates.filter(date => {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if doctor works on this day
      if (!selectedDoctor.availableDays.includes(dayOfWeek)) {
        return false;
      }
      
      // Check if doctor has specific unavailability on this date
      if (selectedDoctor.unavailableDates?.includes(date)) {
        return false;
      }
      
      return true;
    });
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if doctor is available on specific date
  const isDoctorAvailableOnDate = (date: string): { available: boolean; reason?: string } => {
    if (!selectedDoctor) return { available: false, reason: 'No doctor selected' };
    
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if doctor works on this day of week
    if (!selectedDoctor.availableDays.includes(dayOfWeek)) {
      return { 
        available: false, 
        reason: `Dr. ${selectedDoctor.name} is not available on ${dayOfWeek}s` 
      };
    }
    
    // Check if doctor has specific unavailability on this date
    if (selectedDoctor.unavailableDates?.includes(date)) {
      return { 
        available: false, 
        reason: `Dr. ${selectedDoctor.name} is on leave` 
      };
    }
    
    return { available: true };
  };

  // Handle branch selection
  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setAvailableDoctors([]);
    setTimeSlots([]);
    setValidationError('');
    
    fetchDoctorsForBranch(branch.id);
    setStep(2);
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSelectedTime('');
    setTimeSlots([]);
    setValidationError('');
    
    setStep(3);
  };

  // Handle date selection - UPDATED
  const handleDateSelect = async (date: string) => {
    // Check if doctor is available on this date
    const availability = isDoctorAvailableOnDate(date);
    if (!availability.available) {
      setValidationError(availability.reason || 'Doctor not available on this date');
      setSelectedDate('');
      setTimeSlots([]);
      return;
    }
    
    setSelectedDate(date);
    setSelectedTime('');
    setTimeSlots([]);
    setValidationError('');
    
    if (selectedDoctor) {
      await fetchTimeSlots(selectedDoctor.id, date);
    }
  };

  // Handle time slot selection
  const handleTimeSelect = async (time: string) => {
    setSelectedTime(time);
    setValidationError('');
    
    if (selectedDoctor && selectedDate) {
      const isAvailable = await checkSlotAvailability(selectedDoctor.id, selectedDate, time);
      if (!isAvailable) {
        setValidationError('This time slot is no longer available. Please select another slot.');
        setSelectedTime('');
      }
    }
  };

  // Check slot availability
  const checkSlotAvailability = async (doctorId: string, date: string, time: string): Promise<boolean> => {
    try {
      // TODO: Replace with your API call
      return true;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedBranch || !selectedDoctor || !selectedDate || !selectedTime) {
      setValidationError('Please complete all required fields');
      return;
    }

    // Double-check doctor availability
    const availability = isDoctorAvailableOnDate(selectedDate);
    if (!availability.available) {
      setValidationError(availability.reason || 'Doctor is no longer available on this date');
      return;
    }

    const isAvailable = await checkSlotAvailability(selectedDoctor.id, selectedDate, selectedTime);
    if (!isAvailable) {
      setValidationError('This time slot is no longer available. Please select another time.');
      return;
    }

    setIsBooking(true);
    setValidationError('');

    try {
      // For now, create a mock appointment
      const mockAppointment = {
        id: Date.now().toString(),
        patientId,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialization: selectedDoctor.specialization,
        branchId: selectedBranch.id,
        branchName: selectedBranch.name,
        branchCode: selectedBranch.code,
        date: selectedDate,
        time: selectedTime,
        token: `MWN-${selectedBranch.code}-${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
        notes,
        notificationPreferences,
        status: 'confirmed' as const,
        type: 'upcoming' as const,
        doctorImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDoctor.name.replace('Dr. ', '')}`,
        createdAt: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      onAppointmentBooked(mockAppointment);
      setStep(4);

      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);

    } catch (error) {
      console.error('Error booking appointment:', error);
      setValidationError('Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedBranch(null);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
    setTimeSlots([]);
    setAvailableDoctors([]);
    setStep(1);
    setValidationError('');
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  // Progress steps
  const steps = [
    { number: 1, label: 'Select Branch', icon: MapPin },
    { number: 2, label: 'Choose Doctor', icon: User },
    { number: 3, label: 'Pick Date & Time', icon: Calendar },
    { number: 4, label: 'Confirmation', icon: CheckCircle },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-black">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Book New Appointment</h2>
              <p className="text-gray-600 mt-1">Complete the steps below to schedule your appointment</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              disabled={isBooking}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-2">
            {steps.map((stepItem, index) => {
              const Icon = stepItem.icon;
              const isActive = step === stepItem.number;
              const isCompleted = step > stepItem.number;
              
              return (
                <div key={stepItem.number} className="flex-1 flex flex-col items-center">
                  <div className="flex items-center w-full">
                    {index > 0 && (
                      <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-[#0A8F7A]' : 'bg-gray-200'}`} />
                    )}
                    
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full
                      ${isActive ? 'bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white' : 
                       isCompleted ? 'bg-[#0A8F7A] text-white' : 'bg-gray-100 text-gray-400'}
                      transition-all duration-300
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 ${step > stepItem.number ? 'bg-[#0A8F7A]' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  
                  <span className={`mt-2 text-sm font-medium ${isActive ? 'text-[#0A8F7A]' : 'text-gray-500'}`}>
                    {stepItem.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Validation Error */}
          {validationError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{validationError}</p>
              </div>
            </div>
          )}

          {/* Step 1: Select Branch */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900">Select MWN Branch</h3>
              </div>

              {loading.branches ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0A8F7A]" />
                </div>
              ) : (
                <>
                  {/* Simple Horizontal Branch Cards */}
                  <div className="space-y-4">
                    {branches.map((branch) => (
                      <div
                        key={branch.id}
                        onClick={() => handleBranchSelect(branch)}
                        className={`group flex items-center justify-between p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          selectedBranch?.id === branch.id
                            ? 'border-[#0A8F7A] bg-gradient-to-r from-[#0A8F7A]/5 to-[#06D6A0]/5'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {/* Left Section: Branch Info */}
                        <div className="flex items-center space-x-4">
                          {/* Branch Icon */}
                          <div className={`
                            flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center
                            ${selectedBranch?.id === branch.id
                              ? 'bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0]'
                              : 'bg-gradient-to-r from-gray-100 to-gray-200'
                            }
                          `}>
                            <Building className={`w-6 h-6 ${
                              selectedBranch?.id === branch.id ? 'text-white' : 'text-gray-600'
                            }`} />
                          </div>

                          {/* Branch Details */}
                          <div className="text-left">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-semibold text-gray-900 text-lg">{branch.name}</h4>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                selectedBranch?.id === branch.id
                                  ? 'bg-[#0A8F7A] text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {branch.code}
                              </span>
                            </div>
                            
                            {/* Location */}
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">{branch.location}</span>
                            </div>
                            
                            {/* Contact & Hours */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <PhoneIcon className="w-4 h-4 mr-1" />
                                <span>{branch.phone}</span>
                              </div>
                              <div className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                <span>{branch.operatingHours}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Section: Selection Indicator & Arrow */}
                        <div className="flex items-center space-x-4">
                          {/* Facilities Badges */}
                          <div className="hidden md:flex items-center space-x-2">
                            {branch.facilities.slice(0, 2).map((facility, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                              >
                                {facility}
                              </span>
                            ))}
                            {branch.facilities.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                +{branch.facilities.length - 2}
                              </span>
                            )}
                          </div>

                          {/* Selection Indicator */}
                          {selectedBranch?.id === branch.id ? (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-5 h-5 text-[#0A8F7A]" />
                              <span className="text-sm font-medium text-[#0A8F7A]">Selected</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-gray-400 group-hover:text-gray-600">
                              <span className="text-sm font-medium">Select</span>
                              <RightArrow className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Branch Selection Tips */}
                  <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Selecting Your Branch</h4>
                        <p className="text-sm text-gray-700">
                          Choose the branch most convenient for you. Your selection will determine which doctors 
                          and services are available for your appointment. You can change branches at any time.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Select Doctor */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Select Doctor / Consultant</h3>
                  <p className="text-gray-600 mt-1">Available at {selectedBranch?.name}</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Change Branch
                </button>
              </div>

              {loading.doctors ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0A8F7A]" />
                </div>
              ) : (
                <div className="space-y-4">
                  {availableDoctors.map(doctor => (
                    <button
                      key={doctor.id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className={`w-full p-5 border-2 rounded-xl text-left transition-all duration-300 ${
                        selectedDoctor?.id === doctor.id
                          ? 'border-[#0A8F7A] bg-gradient-to-r from-[#0A8F7A]/5 to-[#06D6A0]/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                            <div className="flex items-center mt-1">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {doctor.specialization}
                              </span>
                            </div>
                            <div className="flex items-center mt-3 space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <CalendarDays className="w-4 h-4 mr-1" />
                                <span>{doctor.availableDays.join(', ')}</span>
                              </div>
                              <div className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                <span>{doctor.availableHours.start} - {doctor.availableHours.end}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {selectedDoctor?.id === doctor.id && (
                          <CheckCircle className="w-6 h-6 text-[#0A8F7A]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {availableDoctors.length === 0 && !loading.doctors && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900">No doctors available</h4>
                  <p className="text-gray-600 mt-2">No doctors are currently available at this branch.</p>
                  <button
                    onClick={() => setStep(1)}
                    className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    Select Another Branch
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Date & Time - UPDATED */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Select Date & Time</h3>
                  <p className="text-gray-600 mt-1">
                    {selectedDoctor?.name} • {selectedBranch?.name}
                  </p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Change Doctor
                </button>
              </div>

              {/* Doctor's Availability Info */}
              {selectedDoctor && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-start">
                    <CalendarDays className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Doctor's Schedule</h4>
                      <p className="text-sm text-blue-700">
                        Dr. {selectedDoctor.name} is available on: <span className="font-medium">{selectedDoctor.availableDays.join(', ')}</span>
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Hours: <span className="font-medium">{selectedDoctor.availableHours.start} - {selectedDoctor.availableHours.end}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Date Selection - UPDATED */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Select Date</h4>
                    </div>
                    <span className="text-sm text-gray-500">
                      Showing next 30 days
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {getFilteredAvailableDates().map(date => {
                      const availability = isDoctorAvailableOnDate(date);
                      const isAvailable = availability.available;
                      
                      return (
                        <button
                          key={date}
                          onClick={() => isAvailable && handleDateSelect(date)}
                          disabled={!isAvailable}
                          className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                            selectedDate === date
                              ? 'border-[#0A8F7A] bg-gradient-to-r from-[#0A8F7A]/5 to-[#06D6A0]/5'
                              : !isAvailable
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium text-gray-900">{formatDate(date)}</p>
                                {!isAvailable && (
                                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                    Not Available
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm mt-1 ${
                                isAvailable ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {isAvailable ? (
                                  <span className="flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Doctor available
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <Ban className="w-3 h-3 mr-1" />
                                    {availability.reason}
                                  </span>
                                )}
                              </p>
                            </div>
                            {selectedDate === date && (
                              <CheckCircle className="w-5 h-5 text-[#0A8F7A]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {getFilteredAvailableDates().length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <Ban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="font-medium text-gray-900 mb-2">No Available Dates</h4>
                      <p className="text-gray-600">
                        Dr. {selectedDoctor?.name} has no availability in the next 30 days.
                      </p>
                    </div>
                  )}
                </div>

                {/* Time Slots - UPDATED */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Available Time Slots</h4>
                    </div>
                    {selectedDate && (
                      <span className="text-sm text-gray-500">{formatDate(selectedDate)}</span>
                    )}
                  </div>

                  {loading.timeSlots ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#0A8F7A]" />
                    </div>
                  ) : !selectedDate ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Please select an available date first</p>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="text-center py-12 bg-amber-50 rounded-2xl border border-amber-200">
                      <Ban className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                      <h4 className="font-medium text-amber-800 mb-2">No time slots available</h4>
                      <p className="text-amber-700">
                        Dr. {selectedDoctor?.name} has no available time slots for this date.
                        Please select another date.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {timeSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => slot.isAvailable && handleTimeSelect(slot.time)}
                            disabled={!slot.isAvailable}
                            className={`p-4 border-2 rounded-xl text-center transition-all ${
                              selectedTime === slot.time
                                ? 'border-[#0A8F7A] bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white'
                                : slot.isAvailable
                                ? slot.isPeakHour
                                  ? 'border-amber-200 bg-amber-50 hover:border-amber-300'
                                  : 'border-green-200 bg-green-50 hover:border-green-300'
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          >
                            <p className={`font-medium ${
                              selectedTime === slot.time ? 'text-white' :
                              !slot.isAvailable ? 'text-gray-400' :
                              slot.isPeakHour ? 'text-amber-800' : 'text-green-800'
                            }`}>
                              {slot.time}
                            </p>
                            <div className="flex items-center justify-center mt-2 space-x-1">
                              {slot.isPeakHour && (
                                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                                  Peak
                                </span>
                              )}
                              {!slot.isAvailable && (
                                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                                  Booked
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Time Slot Legend */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-gray-600">Available</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                            <span className="text-gray-600">Peak Hour</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-gray-600">Booked</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                  rows={3}
                  placeholder="Any specific concerns, symptoms, or special requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Notification Preferences */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3">Notification Preferences</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#0A8F7A] focus:ring-[#0A8F7A]" 
                      checked={notificationPreferences.email}
                      onChange={(e) => setNotificationPreferences(prev => ({ ...prev, email: e.target.checked }))}
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-700">Email Reminder</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">24 hours before appointment</p>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#0A8F7A] focus:ring-[#0A8F7A]" 
                      checked={notificationPreferences.sms}
                      onChange={(e) => setNotificationPreferences(prev => ({ ...prev, sms: e.target.checked }))}
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-700">SMS Reminder</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">2 hours before appointment</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Double Booking Protection Note */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-start">
                  <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Double Booking Protection</p>
                    <p className="text-sm text-green-700 mt-1">
                      Our system prevents double booking. The time slot you select will be exclusively reserved for you.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedTime || isBooking}
                  className="px-8 py-3 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-100 mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900">Appointment Confirmed!</h3>
              <p className="text-gray-600 mt-2">Your appointment has been successfully scheduled</p>
              
              <div className="mt-8 bg-gradient-to-r from-[#0A8F7A]/5 to-[#06D6A0]/5 rounded-2xl p-6 border border-[#0A8F7A]/20">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-white mr-2" />
                  <span className="text-white font-medium">Appointment Token</span>
                </div>
                <p className="text-2xl font-bold text-[#0A8F7A] font-mono tracking-wide">
                  MWN-{selectedBranch?.code}-{new Date().getFullYear()}-{(new Date().getMonth() + 1).toString().padStart(2, '0')}{new Date().getDate().toString().padStart(2, '0')}-{Math.floor(1000 + Math.random() * 9000)}
                </p>
                <p className="text-sm text-gray-600 mt-2">Keep this token for your records</p>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500">Doctor</p>
                  <p className="font-medium text-gray-900">{selectedDoctor?.name}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="font-medium text-gray-900">{selectedBranch?.name}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{selectedDate && formatDate(selectedDate)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">{selectedTime}</p>
                </div>
              </div>
              
              <div className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600 mr-2" />
                  <p className="text-blue-700">
                    Confirmation and reminder {notificationPreferences.email && 'email'} 
                    {notificationPreferences.email && notificationPreferences.sms && ' and '}
                    {notificationPreferences.sms && 'SMS'} will be sent shortly
                  </p>
                </div>
              </div>
              
              <p className="mt-6 text-gray-500">This window will close automatically...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}