import "dotenv/config";
import { db } from "./firebase.ts";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

async function createCollections() {
  try {
    // 1️⃣ Users
    await setDoc(doc(db, "users", "sampleUser"), {
      name: "John Doe",
      role: "doctor",
      branch: "Colombo",
      createdAt: serverTimestamp(),
    });

    // 2️⃣ Patients
    await setDoc(doc(db, "patients", "samplePatient"), {
      name: "Jane Smith",
      dob: "1990-01-01",
      contact: "+94712345678",
      medicalHistory: "None",
      branch: "Colombo",
      createdAt: serverTimestamp(),
    });

    // 3️⃣ Appointments
    await setDoc(doc(db, "appointments", "sampleAppointment"), {
      patientId: "samplePatient",
      doctorId: "sampleUser",
      date: "2026-01-20",
      time: "10:00",
      status: "pending",
    });

    // 4️⃣ Wellness Packages
    await setDoc(doc(db, "wellnessPackages", "samplePackage"), {
      name: "Nutrition Plan",
      sessions: 5,
      pricePerSession: 50,
      membershipDiscounts: 10,
    });

    // 5️⃣ Billing
    await setDoc(doc(db, "billing", "sampleBill"), {
      patientId: "samplePatient",
      packageId: "samplePackage",
      basePrice: 250,
      discount: 25,
      tax: 22.5,
      finalPrice: 247.5,
      createdAt: serverTimestamp(),
    });

    // 6️⃣ Wellness Experts
    await setDoc(doc(db, "wellnessExperts", "sampleExpert"), {
      name: "Dr. Alex",
      specialty: "Fitness",
      branch: "Colombo",
    });

    // 7️⃣ Wellness Programs
    await setDoc(doc(db, "wellnessPrograms", "sampleProgram"), {
      name: "Morning Yoga",
      packageId: "samplePackage",
      schedule: "Mon-Wed-Fri 7:00 AM",
    });

    console.log("All collections created with sample documents!");
  } catch (error) {
    console.error("Error creating collections:", error);
  }
}

// Run the script
createCollections();
