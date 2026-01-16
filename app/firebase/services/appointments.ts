import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled";

export interface Appointment {
  id?: string;
  patientId: string;
  doctorId: string;
  branchId: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  token: string;
  status: AppointmentStatus;
  notes?: string;
  reason?: string;
  symptoms?: string[];
  duration?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  // Additional fields for display
  doctorName?: string;
  doctorSpecialization?: string;
  branchName?: string;
  branchCode?: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  type?: "upcoming" | "past";
}

// Create new appointment
export const createAppointment = async (appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const appointmentRef = await addDoc(collection(db, "appointments"), {
      ...appointmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return appointmentRef.id;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw new Error("Failed to create appointment");
  }
};

// Get appointment by ID
export const getAppointmentById = async (appointmentId: string): Promise<Appointment | null> => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    
    if (appointmentSnap.exists()) {
      const data = appointmentSnap.data();
      return {
        id: appointmentSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Appointment;
    }
    return null;
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw new Error("Failed to fetch appointment");
  }
};

// Get appointments by patient ID
export const getAppointmentsByPatientId = async (patientId: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", patientId),
      orderBy("date", "desc"),
      orderBy("time", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Appointment;
    });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    throw new Error("Failed to fetch appointments");
  }
};

// Get appointments by doctor ID
export const getAppointmentsByDoctorId = async (doctorId: string, date?: string): Promise<Appointment[]> => {
  try {
    let q;
    if (date) {
      q = query(
        collection(db, "appointments"),
        where("doctorId", "==", doctorId),
        where("date", "==", date),
        orderBy("time", "asc")
      );
    } else {
      q = query(
        collection(db, "appointments"),
        where("doctorId", "==", doctorId),
        orderBy("date", "desc"),
        orderBy("time", "desc")
      );
    }
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Appointment;
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    throw new Error("Failed to fetch appointments");
  }
};

// Get appointments by branch ID
export const getAppointmentsByBranchId = async (branchId: string, date?: string): Promise<Appointment[]> => {
  try {
    let q;
    if (date) {
      q = query(
        collection(db, "appointments"),
        where("branchId", "==", branchId),
        where("date", "==", date),
        orderBy("time", "asc")
      );
    } else {
      q = query(
        collection(db, "appointments"),
        where("branchId", "==", branchId),
        orderBy("date", "desc"),
        orderBy("time", "desc")
      );
    }
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Appointment;
    });
  } catch (error) {
    console.error("Error fetching branch appointments:", error);
    throw new Error("Failed to fetch appointments");
  }
};

// Check if time slot is available
export const checkTimeSlotAvailability = async (
  doctorId: string,
  branchId: string,
  date: string,
  time: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorId),
      where("branchId", "==", branchId),
      where("date", "==", date),
      where("time", "==", time),
      where("status", "in", ["confirmed", "pending"])
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error("Error checking availability:", error);
    return false;
  }
};

// Update appointment
export const updateAppointment = async (
  appointmentId: string,
  updates: Partial<Appointment>
): Promise<void> => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await updateDoc(appointmentRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw new Error("Failed to update appointment");
  }
};

// Delete appointment
export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await deleteDoc(appointmentRef);
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw new Error("Failed to delete appointment");
  }
};

// Get all appointments with filters
export const getAllAppointments = async (
  filters?: {
    status?: AppointmentStatus;
    branchId?: string;
    doctorId?: string;
    date?: string;
  }
): Promise<Appointment[]> => {
  try {
    let q = query(collection(db, "appointments"), orderBy("date", "desc"), orderBy("time", "desc"));
    
    if (filters) {
      const constraints: any[] = [];
      if (filters.status) {
        constraints.push(where("status", "==", filters.status));
      }
      if (filters.branchId) {
        constraints.push(where("branchId", "==", filters.branchId));
      }
      if (filters.doctorId) {
        constraints.push(where("doctorId", "==", filters.doctorId));
      }
      if (filters.date) {
        constraints.push(where("date", "==", filters.date));
      }
      
      if (constraints.length > 0) {
        q = query(collection(db, "appointments"), ...constraints, orderBy("date", "desc"), orderBy("time", "desc"));
      }
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Appointment;
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw new Error("Failed to fetch appointments");
  }
};
