// app/api/services/doctor.ts
import { db } from "@/app/firebase/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/* ---------------- TYPES ---------------- */

export type Patient = {
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
};

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";
export type Priority = "low" | "medium" | "high" | "emergency";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason: string;

  // Optional extended fields
  priority?: Priority;
  type?: "new" | "follow-up" | "review";
  notes?: string;
  symptoms?: string[];
  labReports?: string[];
  previousVisits?: number;
  insurance?: string;
  bookedAt?: string;
  token?: string;
  duration?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

/* ---------------- DOCTORS ---------------- */

export const createDoctor = async (
  id: string,
  name: string,
  branch: string,
  specialization: string,
) => {
  const docRef = doc(db, "users", id);
  await setDoc(docRef, {
    name,
    role: "doctor",
    branch,
    specialization,
    createdAt: serverTimestamp(),
  });
  return { id, name, branch, specialization };
};

export const getDoctorById = async (id: string) => {
  const docRef = doc(db, "users", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

// Fixed: Fetch from "users" collection where role="doctor"
export const getDoctorDetails = async (doctorId: string): Promise<Doctor> => {
  const docRef = doc(db, "users", doctorId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // Return default values to prevent errors
    return {
      id: doctorId,
      name: "Dr. John Doe",
      specialization: "General Physician",
    };
  }

  const data = docSnap.data();

  return {
    id: docSnap.id,
    name: data.name || "Dr. John Doe",
    specialization: data.specialization || "General Physician",
  };
};

/* ---------------- PATIENTS ---------------- */

export const createPatient = async (
  id: string,
  name: string,
  dob: string,
  contact: string,
  branch: string,
  medicalHistory = "",
) => {
  await setDoc(doc(db, "patients", id), {
    name,
    dob,
    contact,
    branch,
    medicalHistory,
    createdAt: serverTimestamp(),
  });
};

export const getPatientById = async (patientId: string): Promise<Patient> => {
  const docRef = doc(db, "patients", patientId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return {
      name: "Unknown Patient",
      age: undefined,
      gender: undefined,
      phone: undefined,
    };
  }

  const data = docSnap.data();

  return {
    name: data.name || "Unknown Patient",
    age: data.age,
    gender: data.gender,
    phone: data.contact || data.phone,
  };
};

/* ---------------- APPOINTMENTS ---------------- */

export const createAppointment = async (
  id: string,
  patientId: string,
  doctorId: string,
  date: string,
  time: string,
  bookedBy: string,
  status: AppointmentStatus = "pending",
  reason = "",
  type: "new" | "follow-up" | "review" = "new",
  priority: Priority = "low",
) => {
  // First get patient details
  const patient = await getPatientById(patientId);

  await setDoc(doc(db, "appointments", id), {
    patientId,
    doctorId,
    patientName: patient.name,
    patientAge: patient.age,
    patientGender: patient.gender,
    patientPhone: patient.phone,
    date,
    time,
    status,
    reason,
    type,
    priority,
    bookedBy,
    bookedAt: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
};

// UPDATED: Fetch appointments with safe defaults for missing fields
export const getDoctorAppointments = async (
  doctorId: string,
): Promise<Appointment[]> => {
  const q = query(
    collection(db, "appointments"),
    where("doctorId", "==", doctorId),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    // Patient details - try to fetch from patients collection if not in appointment
    let patientName = "Unknown Patient";
    let patientAge: number | undefined = undefined;
    let patientGender: string | undefined = undefined;
    let patientPhone: string | undefined = undefined;

    // If patientName is stored in appointment, use it
    if (data.patientName) {
      patientName = data.patientName;
      patientAge = data.patientAge;
      patientGender = data.patientGender;
      patientPhone = data.patientPhone;
    }
    // Otherwise, we could fetch from patients collection, but for simplicity using defaults

    return {
      id: doc.id,
      patientId: data.patientId || "",
      patientName: patientName,
      patientAge: patientAge,
      patientGender: patientGender,
      patientPhone: patientPhone,
      date: data.date || "",
      time: data.time || "",
      token: data.token || `TK-${doc.id.slice(0, 4).toUpperCase()}`,
      status: data.status || "pending",
      reason: data.reason || "No reason provided",
      priority: data.priority || "medium",
      duration: data.duration || "30 mins",
      type: data.type || "new",
      notes: data.notes || "",
      symptoms: data.symptoms || [],
      labReports: data.labReports || [],
      previousVisits: data.previousVisits || 0,
      insurance: data.insurance || "None",
      bookedAt: data.bookedAt || "",
    };
  });
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
) => {
  await updateDoc(doc(db, "appointments", appointmentId), { status });
};

/* ---------------- WELLNESS PACKAGES ---------------- */

export const createWellnessPackage = async (
  id: string,
  name: string,
  sessions: number,
  pricePerSession: number,
  membershipDiscounts: number,
) => {
  await setDoc(doc(db, "wellnessPackages", id), {
    name,
    sessions,
    pricePerSession,
    membershipDiscounts,
    createdAt: serverTimestamp(),
  });
};

/* ---------------- BILLING ---------------- */

export const createBill = async (
  id: string,
  patientId: string,
  packageId: string,
  basePrice: number,
  discount: number,
  tax: number,
) => {
  const finalPrice = basePrice - discount + tax;
  await setDoc(doc(db, "billing", id), {
    patientId,
    packageId,
    basePrice,
    discount,
    tax,
    finalPrice,
    createdAt: serverTimestamp(),
  });
};

/* ---------------- WELLNESS EXPERTS & PROGRAMS ---------------- */

export const createWellnessExpert = async (
  id: string,
  name: string,
  specialty: string,
  branch: string,
) => {
  await setDoc(doc(db, "wellnessExperts", id), { name, specialty, branch });
};

export const createWellnessProgram = async (
  id: string,
  name: string,
  packageId: string,
  schedule: string,
) => {
  await setDoc(doc(db, "wellnessPrograms", id), { name, packageId, schedule });
};

// Add to your existing doctor.ts file

export interface Staff {
  id: string;
  name: string;
  role: "staff" | "admin";
  department: string;
  branch: string;
  email?: string;
  phone?: string;
  permissions?: string[];
}

export interface BillingRecord {
  id: string;
  patientId: string;
  appointmentId: string;
  patientName: string;
  services: { name: string; amount: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "partial";
  paymentMethod?: string;
  paidAt?: string;
  createdBy: string;
  createdAt: string;
}

// Staff functions
export const getStaffDetails = async (staffId: string): Promise<Staff> => {
  const docRef = doc(db, "users", staffId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Staff not found");
  }

  const data = docSnap.data();

  return {
    id: docSnap.id,
    name: data.name || "Unknown Staff",
    role: data.role === "admin" ? "admin" : "staff",
    department: data.department || "General",
    branch: data.branch || "Main",
    email: data.email,
    phone: data.phone,
    permissions: data.permissions || [],
  };
};

export const getAllAppointments = async (): Promise<Appointment[]> => {
  const q = query(collection(db, "appointments"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      patientId: data.patientId || "",
      patientName: data.patientName || "Unknown Patient",
      patientAge: data.patientAge,
      patientGender: data.patientGender,
      patientPhone: data.patientPhone,
      date: data.date || "",
      time: data.time || "",
      token: data.token || `TK-${doc.id.slice(0, 4).toUpperCase()}`,
      status: data.status || "pending",
      reason: data.reason || "No reason provided",
      priority: data.priority || "medium",
      duration: data.duration || "30 mins",
      type: data.type || "new",
      symptoms: data.symptoms || [],
      labReports: data.labReports || [],
      previousVisits: data.previousVisits || 0,
      insurance: data.insurance || "None",
      bookedAt: data.bookedAt || "",
      bookedBy: data.bookedBy,
      doctorId: data.doctorId,
    };
  });
};

export const getBillingRecords = async (): Promise<BillingRecord[]> => {
  const q = query(collection(db, "billing"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      patientId: data.patientId || "",
      appointmentId: data.appointmentId || "",
      patientName: data.patientName || "Unknown Patient",
      services: data.services || [],
      subtotal: data.subtotal || 0,
      discount: data.discount || 0,
      tax: data.tax || 0,
      total: data.total || 0,
      status: data.status || "pending",
      paymentMethod: data.paymentMethod,
      paidAt: data.paidAt,
      createdBy: data.createdBy || "",
      createdAt: data.createdAt || "",
    };
  });
};
