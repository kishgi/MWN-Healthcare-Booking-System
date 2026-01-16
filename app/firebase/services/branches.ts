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
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

export interface Branch {
  id?: string;
  name: string;
  code: string; // Unique branch code (e.g., 'CLB', 'KDY')
  location: string;
  address: string;
  phone: string;
  email?: string;
  operatingHours: string;
  facilities: string[];
  description?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

// Create new branch
export const createBranch = async (branchData: Omit<Branch, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const branchRef = await addDoc(collection(db, "branches"), {
      ...branchData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return branchRef.id;
  } catch (error) {
    console.error("Error creating branch:", error);
    throw new Error("Failed to create branch");
  }
};

// Get branch by ID
export const getBranchById = async (branchId: string): Promise<Branch | null> => {
  try {
    const branchRef = doc(db, "branches", branchId);
    const branchSnap = await getDoc(branchRef);
    
    if (branchSnap.exists()) {
      const data = branchSnap.data();
      return {
        id: branchSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Branch;
    }
    return null;
  } catch (error) {
    console.error("Error fetching branch:", error);
    throw new Error("Failed to fetch branch");
  }
};

// Get branch by code
export const getBranchByCode = async (code: string): Promise<Branch | null> => {
  try {
    const q = query(collection(db, "branches"), where("code", "==", code));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Branch;
    }
    return null;
  } catch (error) {
    console.error("Error fetching branch by code:", error);
    throw new Error("Failed to fetch branch");
  }
};

// Get all branches
export const getAllBranches = async (): Promise<Branch[]> => {
  try {
    const q = query(collection(db, "branches"), orderBy("name"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Branch;
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw new Error("Failed to fetch branches");
  }
};

// Update branch
export const updateBranch = async (branchId: string, updates: Partial<Branch>): Promise<void> => {
  try {
    const branchRef = doc(db, "branches", branchId);
    await updateDoc(branchRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating branch:", error);
    throw new Error("Failed to update branch");
  }
};

// Delete branch
export const deleteBranch = async (branchId: string): Promise<void> => {
  try {
    const branchRef = doc(db, "branches", branchId);
    await deleteDoc(branchRef);
  } catch (error) {
    console.error("Error deleting branch:", error);
    throw new Error("Failed to delete branch");
  }
};
