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

export interface Doctor {
  id?: string;
  userId?: string; // Link to users collection
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification?: string;
  experience?: number;
  branchId?: string;
  branchName?: string;
  availableDays?: string[]; // ['Monday', 'Wednesday', 'Friday']
  availableHours?: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  unavailableDates?: string[]; // ['YYYY-MM-DD']
  consultationFee?: number;
  avatar?: string;
  bio?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

// Create new doctor
export const createDoctor = async (doctorData: Omit<Doctor, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const doctorRef = await addDoc(collection(db, "doctors"), {
      ...doctorData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return doctorRef.id;
  } catch (error) {
    console.error("Error creating doctor:", error);
    throw new Error("Failed to create doctor");
  }
};

// Get doctor by ID
export const getDoctorById = async (doctorId: string): Promise<Doctor | null> => {
  try {
    const doctorRef = doc(db, "doctors", doctorId);
    const doctorSnap = await getDoc(doctorRef);
    
    if (doctorSnap.exists()) {
      const data = doctorSnap.data();
      return {
        id: doctorSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Doctor;
    }
    return null;
  } catch (error) {
    console.error("Error fetching doctor:", error);
    throw new Error("Failed to fetch doctor");
  }
};

// Get doctor by user ID
export const getDoctorByUserId = async (userId: string): Promise<Doctor | null> => {
  try {
    const q = query(collection(db, "doctors"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Doctor;
    }
    return null;
  } catch (error) {
    console.error("Error fetching doctor by user ID:", error);
    throw new Error("Failed to fetch doctor");
  }
};

// Get doctors by branch ID
export const getDoctorsByBranchId = async (branchId: string): Promise<Doctor[]> => {
  try {
    const q = query(
      collection(db, "doctors"),
      where("branchId", "==", branchId),
      orderBy("name")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Doctor;
    });
  } catch (error) {
    console.error("Error fetching doctors by branch:", error);
    throw new Error("Failed to fetch doctors");
  }
};

// Get all doctors
export const getAllDoctors = async (): Promise<Doctor[]> => {
  try {
    const q = query(collection(db, "doctors"), orderBy("name"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Doctor;
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw new Error("Failed to fetch doctors");
  }
};

// Update doctor
export const updateDoctor = async (doctorId: string, updates: Partial<Doctor>): Promise<void> => {
  try {
    const doctorRef = doc(db, "doctors", doctorId);
    await updateDoc(doctorRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    throw new Error("Failed to update doctor");
  }
};

// Delete doctor
export const deleteDoctor = async (doctorId: string): Promise<void> => {
  try {
    const doctorRef = doc(db, "doctors", doctorId);
    await deleteDoc(doctorRef);
  } catch (error) {
    console.error("Error deleting doctor:", error);
    throw new Error("Failed to delete doctor");
  }
};

// Search doctors
export const searchDoctors = async (searchTerm: string, branchId?: string): Promise<Doctor[]> => {
  try {
    let q;
    if (branchId) {
      q = query(
        collection(db, "doctors"),
        where("branchId", "==", branchId),
        orderBy("name")
      );
    } else {
      q = query(collection(db, "doctors"), orderBy("name"));
    }
    
    const querySnapshot = await getDocs(q);
    const searchLower = searchTerm.toLowerCase();
    
    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Doctor;
      })
      .filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchLower) ||
          doctor.specialization.toLowerCase().includes(searchLower) ||
          doctor.email.toLowerCase().includes(searchLower)
      );
  } catch (error) {
    console.error("Error searching doctors:", error);
    throw new Error("Failed to search doctors");
  }
};
