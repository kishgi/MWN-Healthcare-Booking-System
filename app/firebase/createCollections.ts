// seed-complete-data.ts
import "dotenv/config";
import { db } from "./firebase.ts";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

async function clearAllCollections() {
  try {
    console.log("Clearing all collections...");

    // List of all collections to clear
    const collections = [
      "users",
      "patients",
      "appointments",
      "wellnessPackages",
      "billing",
      "wellnessExperts",
      "wellnessPrograms",
      // Add any other collections you have
    ];

    // Clear each collection
    for (const collectionName of collections) {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const deletePromises = querySnapshot.docs.map((docSnap) =>
          deleteDoc(docSnap.ref),
        );
        await Promise.all(deletePromises);
        console.log(
          `Cleared ${collectionName} collection (${querySnapshot.size} documents)`,
        );
      } catch (error) {
        console.warn(`Could not clear ${collectionName}:`, error.message);
      }
    }

    console.log("All collections cleared successfully!");
  } catch (error) {
    console.error("Error clearing collections:", error);
  }
}

async function seedCompleteData() {
  try {
    // First, clear all existing data
    await clearAllCollections();

    console.log("\nSeeding new sample data...");

    // =============== USERS COLLECTION ===============
    // 1️⃣ Doctor
    await setDoc(doc(db, "users", "DR-001"), {
      name: "Dr. Sarah Johnson",
      role: "doctor",
      specialization: "Cardiology",
      branch: "Colombo",
      email: "sarah.johnson@hospital.com",
      phone: "+94771122334",
      createdAt: serverTimestamp(),
    });
    console.log("Created doctor: Dr. Sarah Johnson");

    // 2️⃣ Admin Staff
    await setDoc(doc(db, "users", "STF-001"), {
      name: "John Doe",
      role: "staff",
      department: "Administration",
      branch: "Colombo",
      email: "john.doe@hospital.com",
      phone: "+94772233445",
      permissions: ["manage_appointments", "manage_patients", "manage_billing"],
      createdAt: serverTimestamp(),
    });

    // 3️⃣ Reception Staff
    await setDoc(doc(db, "users", "STF-002"), {
      name: "Emma Wilson",
      role: "staff",
      department: "Reception",
      branch: "Colombo",
      email: "emma.wilson@hospital.com",
      phone: "+94773344556",
      permissions: ["manage_appointments", "check_in_patients"],
      createdAt: serverTimestamp(),
    });
    console.log("Created 2 staff members");

    // =============== PATIENTS COLLECTION ===============
    // 4️⃣ Patients
    await setDoc(doc(db, "patients", "PAT-001"), {
      name: "Robert Chen",
      age: 45,
      gender: "Male",
      contact: "+94771234567",
      email: "robert.chen@email.com",
      address: "123 Main Street, Colombo",
      medicalHistory: "Hypertension, Type 2 Diabetes",
      bloodGroup: "O+",
      insurance: "AIA Insurance",
      emergencyContact: "+94779988777",
      branch: "Colombo",
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "patients", "PAT-002"), {
      name: "Emma Wilson",
      age: 32,
      gender: "Female",
      contact: "+94776543210",
      email: "emma.wilson@email.com",
      address: "456 Oak Avenue, Colombo",
      medicalHistory: "Asthma, Allergies",
      bloodGroup: "A+",
      insurance: "Ceylinco Insurance",
      emergencyContact: "+94778899777",
      branch: "Colombo",
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "patients", "PAT-003"), {
      name: "James Smith",
      age: 28,
      gender: "Male",
      contact: "+94770011223",
      email: "james.smith@email.com",
      address: "789 Pine Road, Colombo",
      medicalHistory: "Migraine",
      bloodGroup: "B+",
      insurance: "National Insurance",
      emergencyContact: "+94776655444",
      branch: "Colombo",
      createdAt: serverTimestamp(),
    });
    console.log("Created 3 patients");

    // =============== APPOINTMENTS COLLECTION ===============
    // 5️⃣ Appointments
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];
    const dayAfterTomorrow = new Date(Date.now() + 172800000)
      .toISOString()
      .split("T")[0];

    await setDoc(doc(db, "appointments", "APP-001"), {
      patientId: "PAT-001",
      doctorId: "DR-001",
      patientName: "Robert Chen",
      patientAge: 45,
      patientGender: "Male",
      patientPhone: "+94771234567",
      date: today,
      time: "09:00 AM",
      token: "TK-1001",
      status: "confirmed",
      reason: "Chest pain and shortness of breath",
      priority: "high",
      duration: "45 mins",
      type: "new",
      symptoms: ["Chest pain", "Shortness of breath", "Fatigue"],
      labReports: ["ECG", "Blood work"],
      previousVisits: 0,
      insurance: "AIA Insurance",
      bookedBy: "STF-002", // Booked by reception staff
      bookedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "appointments", "APP-002"), {
      patientId: "PAT-002",
      doctorId: "DR-001",
      patientName: "Emma Wilson",
      patientAge: 32,
      patientGender: "Female",
      patientPhone: "+94776543210",
      date: today,
      time: "10:30 AM",
      token: "TK-1002",
      status: "pending",
      reason: "Regular asthma checkup",
      priority: "medium",
      duration: "30 mins",
      type: "follow-up",
      symptoms: ["Cough", "Wheezing"],
      labReports: ["Spirometry"],
      previousVisits: 3,
      insurance: "Ceylinco Insurance",
      bookedBy: "STF-002",
      bookedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "appointments", "APP-003"), {
      patientId: "PAT-001",
      doctorId: "DR-001",
      patientName: "Robert Chen",
      patientAge: 45,
      patientGender: "Male",
      patientPhone: "+94771234567",
      date: today,
      time: "02:00 PM",
      token: "TK-1003",
      status: "completed",
      reason: "Follow-up on medication",
      priority: "low",
      duration: "20 mins",
      type: "review",
      symptoms: ["Stable condition"],
      labReports: [],
      previousVisits: 1,
      insurance: "AIA Insurance",
      bookedBy: "STF-001",
      bookedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "appointments", "APP-004"), {
      patientId: "PAT-003",
      doctorId: "DR-001",
      patientName: "James Smith",
      patientAge: 28,
      patientGender: "Male",
      patientPhone: "+94770011223",
      date: tomorrow,
      time: "11:00 AM",
      token: "TK-1004",
      status: "confirmed",
      reason: "Migraine treatment follow-up",
      priority: "medium",
      duration: "30 mins",
      type: "follow-up",
      symptoms: ["Headache", "Nausea"],
      labReports: ["MRI Scan"],
      previousVisits: 2,
      insurance: "National Insurance",
      bookedBy: "STF-001",
      bookedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "appointments", "APP-005"), {
      patientId: "PAT-002",
      doctorId: "DR-001",
      patientName: "Emma Wilson",
      patientAge: 32,
      patientGender: "Female",
      patientPhone: "+94776543210",
      date: dayAfterTomorrow,
      time: "03:30 PM",
      token: "TK-1005",
      status: "pending",
      reason: "Annual health checkup",
      priority: "low",
      duration: "60 mins",
      type: "review",
      symptoms: ["General checkup"],
      labReports: ["Complete blood test", "X-ray"],
      previousVisits: 4,
      insurance: "Ceylinco Insurance",
      bookedBy: "STF-002",
      bookedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
    console.log("Created 5 appointments");

    // =============== BILLING COLLECTION ===============
    // 6️⃣ Billing Records
    await setDoc(doc(db, "billing", "BILL-001"), {
      patientId: "PAT-001",
      appointmentId: "APP-001",
      patientName: "Robert Chen",
      services: [
        { name: "Consultation", amount: 5000 },
        { name: "ECG Test", amount: 2500 },
        { name: "Blood Work", amount: 3000 },
      ],
      subtotal: 10500,
      discount: 1050,
      tax: 945,
      total: 10395,
      status: "paid",
      paymentMethod: "credit_card",
      paidAt: new Date().toISOString(),
      createdBy: "STF-001",
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "billing", "BILL-002"), {
      patientId: "PAT-002",
      appointmentId: "APP-002",
      patientName: "Emma Wilson",
      services: [
        { name: "Consultation", amount: 5000 },
        { name: "Spirometry", amount: 2000 },
      ],
      subtotal: 7000,
      discount: 700,
      tax: 630,
      total: 6930,
      status: "pending",
      paymentMethod: "cash",
      createdBy: "STF-002",
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "billing", "BILL-003"), {
      patientId: "PAT-003",
      appointmentId: "APP-004",
      patientName: "James Smith",
      services: [
        { name: "Consultation", amount: 5000 },
        { name: "MRI Scan", amount: 15000 },
      ],
      subtotal: 20000,
      discount: 2000,
      tax: 1800,
      total: 19800,
      status: "partial",
      amountPaid: 10000,
      balanceDue: 9800,
      paymentMethod: "insurance",
      createdBy: "STF-001",
      createdAt: serverTimestamp(),
    });
    console.log("Created 3 billing records");

    // =============== WELLNESS PACKAGES ===============
    await setDoc(doc(db, "wellnessPackages", "WP-001"), {
      name: "Cardiac Wellness Plan",
      description: "Comprehensive cardiac care package",
      sessions: 10,
      pricePerSession: 7500,
      totalPrice: 75000,
      membershipDiscounts: 15,
      duration: "3 months",
      includes: [
        "Initial consultation",
        "ECG tests",
        "Blood pressure monitoring",
        "Diet plan",
        "Exercise regimen",
      ],
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "wellnessPackages", "WP-002"), {
      name: "Diabetes Management",
      description: "Complete diabetes care and monitoring",
      sessions: 12,
      pricePerSession: 6000,
      totalPrice: 72000,
      membershipDiscounts: 10,
      duration: "4 months",
      includes: [
        "Blood sugar monitoring",
        "Nutrition counseling",
        "Medication management",
        "Regular checkups",
      ],
      createdAt: serverTimestamp(),
    });

    // =============== WELLNESS EXPERTS ===============
    await setDoc(doc(db, "wellnessExperts", "EXP-001"), {
      name: "Dr. Alex Morgan",
      specialty: "Nutrition & Fitness",
      qualifications: ["PhD in Nutrition", "Certified Fitness Trainer"],
      experience: "10 years",
      branch: "Colombo",
      available: true,
      createdAt: serverTimestamp(),
    });

    // =============== WELLNESS PROGRAMS ===============
    await setDoc(doc(db, "wellnessPrograms", "PROG-001"), {
      name: "Morning Cardiac Wellness",
      packageId: "WP-001",
      schedule: "Mon-Wed-Fri 7:00 AM",
      duration: "60 minutes",
      instructor: "EXP-001",
      maxParticipants: 15,
      currentParticipants: 8,
      status: "active",
      createdAt: serverTimestamp(),
    });

    console.log("\n✅ Complete sample data created successfully!");
    console.log("📋 Summary:");
    console.log("👨‍⚕️ Users:");
    console.log("   - 1 Doctor (DR-001)");
    console.log("   - 2 Staff (STF-001, STF-002)");
    console.log("👥 Patients: 3 patients");
    console.log(
      "📅 Appointments: 5 appointments (today: 3, tomorrow: 1, day after: 1)",
    );
    console.log("💰 Billing: 3 records (paid: 1, pending: 1, partial: 1)");
    console.log("🏥 Wellness: 2 packages, 1 expert, 1 program");
    console.log("\nStaff Login Credentials:");
    console.log("🔐 Admin: STF-001 (John Doe) - Full permissions");
    console.log(
      "🔐 Reception: STF-002 (Emma Wilson) - Appointment & check-in permissions",
    );
  } catch (error) {
    console.error("Error creating collections:", error);
  }
}

// Run the script
seedCompleteData();
