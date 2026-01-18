import { db } from "@/app/firebase/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  updateDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

// =============== TYPES ===============
export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  contact?: string;
  email?: string;
  address?: string;
  medicalHistory?: string;
  bloodGroup?: string;
  insurance?: string;
  emergencyContact?: string;
  createdAt?: any;
}

export interface Doctor {
  id: string;
  name: string;
  role: "doctor";
  specialization: string;
  branch?: string;
  email?: string;
  phone?: string;
  createdAt?: any;
}

export interface Staff {
  id: string;
  name: string;
  role: "staff" | "admin";
  department: string;
  branch?: string;
  email?: string;
  phone?: string;
  permissions?: string[];
  createdAt?: any;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  date: string;
  time: string;
  token: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no-show";
  reason?: string;
  type?: "new" | "follow-up" | "review" | "emergency";
  priority?: "low" | "medium" | "high" | "emergency";
  duration?: string;
  symptoms?: string[];
  labReports?: string[];
  previousVisits?: number;
  insurance?: string;
  bookedBy?: string;
  bookedAt?: string;
  createdAt?: any;
}

export interface BillingRecord {
  id: string;
  patientId: string;
  appointmentId?: string;
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
  createdAt: any;
}

// =============== PATIENT FUNCTIONS ===============
export async function getAllPatients(): Promise<Patient[]> {
  try {
    const patientsCol = collection(db, "patients");
    const snapshot = await getDocs(patientsCol);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Patient[];
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
}

export async function getPatientById(patientId: string): Promise<Patient> {
  try {
    const patientDoc = await getDoc(doc(db, "patients", patientId));
    if (!patientDoc.exists()) {
      throw new Error("Patient not found");
    }
    return { id: patientDoc.id, ...patientDoc.data() } as Patient;
  } catch (error) {
    console.error(`Error fetching patient ${patientId}:`, error);
    throw error;
  }
}

export async function createPatient(
  patientData: Omit<Patient, "id">,
): Promise<Patient> {
  try {
    const patientId = `PAT-${Date.now()}`;
    await setDoc(doc(db, "patients", patientId), {
      ...patientData,
      createdAt: serverTimestamp(),
    });
    return { id: patientId, ...patientData };
  } catch (error) {
    console.error("Error creating patient:", error);
    throw error;
  }
}

export async function updatePatient(
  patientId: string,
  data: Partial<Patient>,
): Promise<void> {
  try {
    await updateDoc(doc(db, "patients", patientId), data);
  } catch (error) {
    console.error(`Error updating patient ${patientId}:`, error);
    throw error;
  }
}

// =============== DOCTOR FUNCTIONS ===============
export async function getAllDoctors(): Promise<Doctor[]> {
  try {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(usersCol);
    return snapshot.docs
      .filter((doc) => doc.data().role === "doctor")
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Doctor[];
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
}

export async function getDoctorById(doctorId: string): Promise<Doctor> {
  try {
    const doctorDoc = await getDoc(doc(db, "users", doctorId));
    if (!doctorDoc.exists()) {
      throw new Error("Doctor not found");
    }
    return { id: doctorDoc.id, ...doctorDoc.data() } as Doctor;
  } catch (error) {
    console.error(`Error fetching doctor ${doctorId}:`, error);
    throw error;
  }
}

// =============== STAFF FUNCTIONS ===============
export async function getAllStaff(): Promise<Staff[]> {
  try {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(usersCol);
    return snapshot.docs
      .filter(
        (doc) => doc.data().role === "staff" || doc.data().role === "admin",
      )
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Staff[];
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw error;
  }
}

export async function getStaffById(staffId: string): Promise<Staff> {
  try {
    const staffDoc = await getDoc(doc(db, "users", staffId));
    if (!staffDoc.exists()) {
      throw new Error("Staff not found");
    }
    return { id: staffDoc.id, ...staffDoc.data() } as Staff;
  } catch (error) {
    console.error(`Error fetching staff ${staffId}:`, error);
    throw error;
  }
}

// =============== APPOINTMENT FUNCTIONS ===============
export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    const appointmentsCol = collection(db, "appointments");
    const q = query(appointmentsCol, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        patientId: data.patientId || "",
        doctorId: data.doctorId || "",
        patientName: data.patientName || "Unknown Patient",
        patientAge: data.patientAge,
        patientGender: data.patientGender,
        patientPhone: data.patientPhone,
        date: data.date || "",
        time: data.time || "",
        token: data.token || `TK-${doc.id.slice(0, 4).toUpperCase()}`,
        status: data.status || "pending",
        reason: data.reason || "No reason provided",
        type: data.type || "new",
        priority: data.priority || "medium",
        duration: data.duration || "30 mins",
        symptoms: data.symptoms || [],
        labReports: data.labReports || [],
        previousVisits: data.previousVisits || 0,
        insurance: data.insurance || "None",
        bookedBy: data.bookedBy,
        bookedAt: data.bookedAt || "",
        createdAt: data.createdAt,
      } as Appointment;
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}

export async function getAppointmentsByDoctor(
  doctorId: string,
): Promise<Appointment[]> {
  try {
    const appointmentsCol = collection(db, "appointments");
    const q = query(
      appointmentsCol,
      where("doctorId", "==", doctorId),
      orderBy("date", "desc"),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        patientId: data.patientId || "",
        doctorId: data.doctorId || "",
        patientName: data.patientName || "Unknown Patient",
        patientAge: data.patientAge,
        patientGender: data.patientGender,
        patientPhone: data.patientPhone,
        date: data.date || "",
        time: data.time || "",
        token: data.token || `TK-${doc.id.slice(0, 4).toUpperCase()}`,
        status: data.status || "pending",
        reason: data.reason || "No reason provided",
        type: data.type || "new",
        priority: data.priority || "medium",
        duration: data.duration || "30 mins",
        symptoms: data.symptoms || [],
        labReports: data.labReports || [],
        previousVisits: data.previousVisits || 0,
        insurance: data.insurance || "None",
        bookedBy: data.bookedBy,
        bookedAt: data.bookedAt || "",
        createdAt: data.createdAt,
      } as Appointment;
    });
  } catch (error) {
    console.error(`Error fetching appointments for doctor ${doctorId}:`, error);
    throw error;
  }
}

export async function getAppointmentsByPatient(
  patientId: string,
): Promise<Appointment[]> {
  try {
    const appointmentsCol = collection(db, "appointments");
    const q = query(
      appointmentsCol,
      where("patientId", "==", patientId),
      orderBy("date", "desc"),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        patientId: data.patientId || "",
        doctorId: data.doctorId || "",
        patientName: data.patientName || "Unknown Patient",
        patientAge: data.patientAge,
        patientGender: data.patientGender,
        patientPhone: data.patientPhone,
        date: data.date || "",
        time: data.time || "",
        token: data.token || `TK-${doc.id.slice(0, 4).toUpperCase()}`,
        status: data.status || "pending",
        reason: data.reason || "No reason provided",
        type: data.type || "new",
        priority: data.priority || "medium",
        duration: data.duration || "30 mins",
        symptoms: data.symptoms || [],
        labReports: data.labReports || [],
        previousVisits: data.previousVisits || 0,
        insurance: data.insurance || "None",
        bookedBy: data.bookedBy,
        bookedAt: data.bookedAt || "",
        createdAt: data.createdAt,
      } as Appointment;
    });
  } catch (error) {
    console.error(
      `Error fetching appointments for patient ${patientId}:`,
      error,
    );
    throw error;
  }
}

export async function createAppointment(appointmentData: {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason?: string;
  type?: "new" | "follow-up" | "review" | "emergency";
  priority?: "low" | "medium" | "high" | "emergency";
  duration?: string;
  bookedBy?: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled" | "no-show";
}): Promise<{ id: string }> {
  try {
    // Get patient details
    const patient = await getPatientById(appointmentData.patientId);

    // Get doctor details
    const doctor = await getDoctorById(appointmentData.doctorId);

    // Generate appointment ID and token
    const appointmentId = `APP-${Date.now()}`;
    const token = `TK-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create appointment data
    const fullAppointmentData = {
      id: appointmentId,
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      patientPhone: patient.contact,
      doctorName: doctor.name,
      date: appointmentData.date,
      time: appointmentData.time,
      token: token,
      status: appointmentData.status || "confirmed",
      reason: appointmentData.reason || "Appointment booked by staff",
      type: appointmentData.type || "new",
      priority: appointmentData.priority || "medium",
      duration: appointmentData.duration || "30 mins",
      symptoms: [],
      labReports: [],
      previousVisits: 0,
      insurance: patient.insurance || "None",
      bookedBy: appointmentData.bookedBy || "STF-001",
      bookedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    };

    // Save to Firestore
    await setDoc(doc(db, "appointments", appointmentId), fullAppointmentData);

    return { id: appointmentId };
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no-show",
): Promise<void> {
  try {
    await updateDoc(doc(db, "appointments", appointmentId), { status });
  } catch (error) {
    console.error(`Error updating appointment ${appointmentId}:`, error);
    throw error;
  }
}

export async function updateAppointment(
  appointmentId: string,
  data: Partial<Appointment>,
): Promise<void> {
  try {
    await updateDoc(doc(db, "appointments", appointmentId), data);
  } catch (error) {
    console.error(`Error updating appointment ${appointmentId}:`, error);
    throw error;
  }
}

// =============== BILLING FUNCTIONS ===============
export async function getAllBillingRecords(): Promise<BillingRecord[]> {
  try {
    const billingCol = collection(db, "billing");
    const q = query(billingCol, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        patientId: data.patientId || "",
        appointmentId: data.appointmentId,
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
        createdAt: data.createdAt,
      } as BillingRecord;
    });
  } catch (error) {
    console.error("Error fetching billing records:", error);
    throw error;
  }
}

export async function getBillingRecordsByPatient(
  patientId: string,
): Promise<BillingRecord[]> {
  try {
    const billingCol = collection(db, "billing");
    const q = query(
      billingCol,
      where("patientId", "==", patientId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        patientId: data.patientId || "",
        appointmentId: data.appointmentId,
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
        createdAt: data.createdAt,
      } as BillingRecord;
    });
  } catch (error) {
    console.error(
      `Error fetching billing records for patient ${patientId}:`,
      error,
    );
    throw error;
  }
}

export async function createBillingRecord(billingData: {
  patientId: string;
  appointmentId?: string;
  patientName: string;
  services: { name: string; amount: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "partial";
  paymentMethod?: string;
  createdBy: string;
}): Promise<{ id: string }> {
  try {
    const billingId = `BILL-${Date.now()}`;
    await setDoc(doc(db, "billing", billingId), {
      ...billingData,
      createdAt: serverTimestamp(),
    });
    return { id: billingId };
  } catch (error) {
    console.error("Error creating billing record:", error);
    throw error;
  }
}

export async function updateBillingStatus(
  billingId: string,
  status: "pending" | "paid" | "partial",
  paymentMethod?: string,
): Promise<void> {
  try {
    const updateData: any = { status };
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (status === "paid") updateData.paidAt = new Date().toISOString();

    await updateDoc(doc(db, "billing", billingId), updateData);
  } catch (error) {
    console.error(`Error updating billing ${billingId}:`, error);
    throw error;
  }
}

// =============== UTILITY FUNCTIONS ===============
export async function getTodayAppointments(): Promise<Appointment[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const appointmentsCol = collection(db, "appointments");
    const q = query(
      appointmentsCol,
      where("date", "==", today),
      orderBy("time", "asc"),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        patientId: data.patientId || "",
        doctorId: data.doctorId || "",
        patientName: data.patientName || "Unknown Patient",
        patientAge: data.patientAge,
        patientGender: data.patientGender,
        patientPhone: data.patientPhone,
        date: data.date || "",
        time: data.time || "",
        token: data.token || `TK-${doc.id.slice(0, 4).toUpperCase()}`,
        status: data.status || "pending",
        reason: data.reason || "No reason provided",
        type: data.type || "new",
        priority: data.priority || "medium",
        duration: data.duration || "30 mins",
        symptoms: data.symptoms || [],
        labReports: data.labReports || [],
        previousVisits: data.previousVisits || 0,
        insurance: data.insurance || "None",
        bookedBy: data.bookedBy,
        bookedAt: data.bookedAt || "",
        createdAt: data.createdAt,
      } as Appointment;
    });
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    throw error;
  }
}

export async function getUpcomingAppointments(
  days: number = 7,
): Promise<Appointment[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const futureDate = new Date(Date.now() + days * 86400000)
      .toISOString()
      .split("T")[0];

    const appointmentsCol = collection(db, "appointments");
    const q = query(
      appointmentsCol,
      where("date", ">=", today),
      where("date", "<=", futureDate),
      orderBy("date", "asc"),
      orderBy("time", "asc"),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        patientId: data.patientId || "",
        doctorId: data.doctorId || "",
        patientName: data.patientName || "Unknown Patient",
        patientAge: data.patientAge,
        patientGender: data.patientGender,
        patientPhone: data.patientPhone,
        date: data.date || "",
        time: data.time || "",
        token: data.token || `TK-${doc.id.slice(0, 4).toUpperCase()}`,
        status: data.status || "pending",
        reason: data.reason || "No reason provided",
        type: data.type || "new",
        priority: data.priority || "medium",
        duration: data.duration || "30 mins",
        symptoms: data.symptoms || [],
        labReports: data.labReports || [],
        previousVisits: data.previousVisits || 0,
        insurance: data.insurance || "None",
        bookedBy: data.bookedBy,
        bookedAt: data.bookedAt || "",
        createdAt: data.createdAt,
      } as Appointment;
    });
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    throw error;
  }
}
