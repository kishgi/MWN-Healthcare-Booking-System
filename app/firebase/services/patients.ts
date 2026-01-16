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

export interface Patient {
  id?: string;
  userId?: string; // Link to users collection
  name: string;
  email: string;
  phone: string;
  dob: string; // YYYY-MM-DD format
  gender?: "male" | "female" | "other";
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  bloodType?: string;
  branch?: string;
  branchId?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  avatar?: string;
}

// Create new patient
export const createPatient = async (patientData: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const patientRef = await addDoc(collection(db, "patients"), {
      ...patientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return patientRef.id;
  } catch (error) {
    console.error("Error creating patient:", error);
    throw new Error("Failed to create patient");
  }
};

// Get patient by ID
export const getPatientById = async (patientId: string): Promise<Patient | null> => {
  try {
    const patientRef = doc(db, "patients", patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (patientSnap.exists()) {
      const data = patientSnap.data();
      return {
        id: patientSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Patient;
    }
    return null;
  } catch (error) {
    console.error("Error fetching patient:", error);
    throw new Error("Failed to fetch patient");
  }
};

// Get patient by user ID
export const getPatientByUserId = async (userId: string): Promise<Patient | null> => {
  try {
    const q = query(collection(db, "patients"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Patient;
    }
    return null;
  } catch (error) {
    console.error("Error fetching patient by user ID:", error);
    throw new Error("Failed to fetch patient");
  }
};

// Get patient by email
export const getPatientByEmail = async (email: string): Promise<Patient | null> => {
  try {
    const q = query(collection(db, "patients"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Patient;
    }
    return null;
  } catch (error) {
    console.error("Error fetching patient by email:", error);
    throw new Error("Failed to fetch patient");
  }
};

// Get all patients
export const getAllPatients = async (branchId?: string): Promise<Patient[]> => {
  try {
    let q;
    if (branchId) {
      q = query(
        collection(db, "patients"),
        where("branchId", "==", branchId),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(collection(db, "patients"), orderBy("createdAt", "desc"));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Patient;
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw new Error("Failed to fetch patients");
  }
};

// Update patient
export const updatePatient = async (patientId: string, updates: Partial<Patient>): Promise<void> => {
  try {
    const patientRef = doc(db, "patients", patientId);
    await updateDoc(patientRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    throw new Error("Failed to update patient");
  }
};

// Delete patient
export const deletePatient = async (patientId: string): Promise<void> => {
  try {
    const patientRef = doc(db, "patients", patientId);
    await deleteDoc(patientRef);
  } catch (error) {
    console.error("Error deleting patient:", error);
    throw new Error("Failed to delete patient");
  }
};

// Search patients
export const searchPatients = async (searchTerm: string): Promise<Patient[]> => {
  try {
    const q = query(collection(db, "patients"), orderBy("name"));
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
        } as Patient;
      })
      .filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchLower) ||
          patient.email.toLowerCase().includes(searchLower) ||
          patient.phone.includes(searchTerm)
      );
  } catch (error) {
    console.error("Error searching patients:", error);
    throw new Error("Failed to search patients");
  }
};
