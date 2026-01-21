// app/patient/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../../components/PatientSidebar";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "@/app/firebase/firebase";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

interface PatientProfile {
  id: string;
  fullName: string;
  gender: string;
  age: number;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  address: string;
  nicPassport: string;
  profilePicture?: string;
  medicalHistory?: string;
  bloodGroup?: string;
  insurance?: string;
  emergencyContact?: string;
  branch?: string;
  role?: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  contactNumber: string;
}

interface MedicalInfo {
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: {
    name: string;
    dose: string;
    schedule: string;
  }[];
  specialNotes: string[];
}

interface LifestylePreferences {
  diet: string;
  exercise: string;
  smoking: string;
  alcohol: string;
  consultationMethod: "in-person" | "teleconsult" | "both";
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function PatientSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Initial patient data
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    id: "",
    fullName: "",
    gender: "",
    age: 0,
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    address: "",
    nicPassport: "",
    profilePicture: "/default-avatar.png",
  });

  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({
    name: "",
    relationship: "",
    contactNumber: "",
  });

  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    bloodGroup: "",
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    specialNotes: [],
  });

  const [lifestylePrefs, setLifestylePrefs] = useState<LifestylePreferences>({
    diet: "",
    exercise: "",
    smoking: "Non-smoker",
    alcohol: "Non-drinker",
    consultationMethod: "both",
  });

  const [passwordChange, setPasswordChange] = useState<PasswordChange>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditing, setIsEditing] = useState({
    profile: false,
    emergency: false,
    medical: false,
    lifestyle: false,
    password: false,
  });

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const consultationMethods = [
    { value: "in-person", label: "In-person only" },
    { value: "teleconsult", label: "Teleconsult only" },
    { value: "both", label: "Both (prefer in-person)" },
    { value: "both-tele", label: "Both (prefer teleconsult)" },
  ];

  // Get current user from Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchPatientData(user);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch patient data from Firestore
  const fetchPatientData = async (user: any) => {
    try {
      setLoading(true);

      // First, check users collection for patient data
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Then check patients collection (if exists separately)
        let patientData = {};
        let patientId = user.uid;

        try {
          const patientsQuery = query(
            collection(db, "patients"),
            where("email", "==", user.email),
          );
          const querySnapshot = await getDocs(patientsQuery);

          if (!querySnapshot.empty) {
            const patientDoc = querySnapshot.docs[0];
            patientData = patientDoc.data();
            patientId = patientDoc.id;
          }
        } catch (error) {
          console.log("No separate patients collection found");
        }

        // Set patient profile combining both sources
        setPatientProfile({
          id: patientId,
          fullName: userData.fullName || user.displayName || "",
          gender: patientData.gender || userData.gender || "",
          age: patientData.age || userData.age || 0,
          dateOfBirth: patientData.dateOfBirth || userData.dateOfBirth || "",
          phoneNumber: patientData.contact || userData.mobile || "",
          email: user.email || "",
          address: patientData.address || userData.address || "",
          nicPassport: patientData.nicPassport || userData.nicPassport || "",
          profilePicture: userData.profilePicture || "/default-avatar.png",
          medicalHistory: patientData.medicalHistory || "",
          bloodGroup: patientData.bloodGroup || "",
          insurance: patientData.insurance || "",
          emergencyContact: patientData.emergencyContact || "",
          branch: patientData.branch || "",
          role: userData.role || "",
        });

        // Parse emergency contact if stored as string
        if (patientData.emergencyContact || userData.emergencyContact) {
          const contactString =
            patientData.emergencyContact || userData.emergencyContact || "";
          const contactParts = contactString.split("|");
          if (contactParts.length >= 2) {
            setEmergencyContact({
              name: contactParts[0] || "",
              relationship: contactParts[1] || "",
              contactNumber: contactParts[2] || contactString,
            });
          } else if (contactString) {
            // If it's just a phone number
            setEmergencyContact({
              name: "",
              relationship: "",
              contactNumber: contactString,
            });
          }
        }

        // Fetch additional medical info
        try {
          const medicalRef = doc(db, "users", user.uid, "medical", "info");
          const medicalSnap = await getDoc(medicalRef);

          if (medicalSnap.exists()) {
            const medicalData = medicalSnap.data();
            setMedicalInfo({
              bloodGroup:
                medicalData.bloodGroup || patientData.bloodGroup || "",
              allergies: medicalData.allergies || [],
              chronicConditions:
                medicalData.chronicConditions ||
                (patientData.medicalHistory
                  ? patientData.medicalHistory.split(",").map((s) => s.trim())
                  : []),
              currentMedications: medicalData.currentMedications || [],
              specialNotes: medicalData.specialNotes || [],
            });
          } else {
            // Fallback to patient data
            setMedicalInfo({
              bloodGroup: patientData.bloodGroup || "",
              allergies: patientData.allergies || [],
              chronicConditions:
                patientData.chronicConditions ||
                (patientData.medicalHistory
                  ? patientData.medicalHistory.split(",").map((s) => s.trim())
                  : []),
              currentMedications: patientData.currentMedications || [],
              specialNotes: patientData.specialNotes || [],
            });
          }
        } catch (error) {
          console.log("No separate medical info found");
        }

        // Fetch lifestyle preferences
        try {
          const lifestyleRef = doc(
            db,
            "users",
            user.uid,
            "preferences",
            "lifestyle",
          );
          const lifestyleSnap = await getDoc(lifestyleRef);

          if (lifestyleSnap.exists()) {
            const lifestyleData = lifestyleSnap.data();
            setLifestylePrefs({
              diet: lifestyleData.diet || "",
              exercise: lifestyleData.exercise || "",
              smoking: lifestyleData.smoking || "Non-smoker",
              alcohol: lifestyleData.alcohol || "Non-drinker",
              consultationMethod: lifestyleData.consultationMethod || "both",
            });
          }
        } catch (error) {
          console.log("No lifestyle preferences found");
        }
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setNotification({
        type: "error",
        message: "Failed to load patient data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (field: keyof PatientProfile, value: string) => {
    setPatientProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmergencyContactUpdate = (
    field: keyof EmergencyContact,
    value: string,
  ) => {
    setEmergencyContact((prev) => ({ ...prev, [field]: value }));
  };

  const handleMedicalInfoUpdate = (field: keyof MedicalInfo, value: any) => {
    setMedicalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleLifestyleUpdate = (
    field: keyof LifestylePreferences,
    value: string,
  ) => {
    setLifestylePrefs((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordUpdate = (field: keyof PasswordChange, value: string) => {
    setPasswordChange((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    if (!currentUser) return;

    try {
      setSaving(true);

      // Update user document
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        fullName: patientProfile.fullName,
        mobile: patientProfile.phoneNumber,
        address: patientProfile.address,
        updatedAt: serverTimestamp(),
      });

      // Try to update patient document if it exists
      try {
        const patientsQuery = query(
          collection(db, "patients"),
          where("email", "==", currentUser.email),
        );
        const querySnapshot = await getDocs(patientsQuery);

        if (!querySnapshot.empty) {
          const patientDoc = querySnapshot.docs[0];
          const patientRef = doc(db, "patients", patientDoc.id);
          await updateDoc(patientRef, {
            name: patientProfile.fullName,
            gender: patientProfile.gender,
            age: patientProfile.age,
            dateOfBirth: patientProfile.dateOfBirth,
            contact: patientProfile.phoneNumber,
            address: patientProfile.address,
            nicPassport: patientProfile.nicPassport,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.log("No patients collection to update");
      }

      setNotification({
        type: "success",
        message: "Profile updated successfully!",
      });
      setIsEditing((prev) => ({ ...prev, profile: false }));
    } catch (error) {
      console.error("Error updating profile:", error);
      setNotification({ type: "error", message: "Failed to update profile" });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const saveEmergencyContact = async () => {
    if (!currentUser) return;

    try {
      setSaving(true);

      const contactString = `${emergencyContact.name}|${emergencyContact.relationship}|${emergencyContact.contactNumber}`;

      // Try to update in patients collection
      try {
        const patientsQuery = query(
          collection(db, "patients"),
          where("email", "==", currentUser.email),
        );
        const querySnapshot = await getDocs(patientsQuery);

        if (!querySnapshot.empty) {
          const patientDoc = querySnapshot.docs[0];
          const patientRef = doc(db, "patients", patientDoc.id);
          await updateDoc(patientRef, {
            emergencyContact: contactString,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.log("No patients collection to update");
      }

      // Also update in users collection
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(
        userRef,
        {
          emergencyContact: contactString,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setNotification({
        type: "success",
        message: "Emergency contact updated!",
      });
      setIsEditing((prev) => ({ ...prev, emergency: false }));
    } catch (error) {
      console.error("Error updating emergency contact:", error);
      setNotification({
        type: "error",
        message: "Failed to update emergency contact",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const saveMedicalInfo = async () => {
    if (!currentUser) return;

    try {
      setSaving(true);

      // Save detailed medical info to subcollection
      const medicalRef = doc(db, "users", currentUser.uid, "medical", "info");
      await updateDoc(
        medicalRef,
        {
          bloodGroup: medicalInfo.bloodGroup,
          allergies: medicalInfo.allergies,
          chronicConditions: medicalInfo.chronicConditions,
          currentMedications: medicalInfo.currentMedications,
          specialNotes: medicalInfo.specialNotes,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      // Try to update patient document if it exists
      try {
        const patientsQuery = query(
          collection(db, "patients"),
          where("email", "==", currentUser.email),
        );
        const querySnapshot = await getDocs(patientsQuery);

        if (!querySnapshot.empty) {
          const patientDoc = querySnapshot.docs[0];
          const patientRef = doc(db, "patients", patientDoc.id);
          await updateDoc(
            patientRef,
            {
              bloodGroup: medicalInfo.bloodGroup,
              medicalHistory: medicalInfo.chronicConditions.join(", "),
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
        }
      } catch (error) {
        console.log("No patients collection to update");
      }

      setNotification({
        type: "success",
        message: "Medical information updated!",
      });
      setIsEditing((prev) => ({ ...prev, medical: false }));
    } catch (error) {
      console.error("Error updating medical info:", error);
      setNotification({
        type: "error",
        message: "Failed to update medical information",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const saveLifestylePrefs = async () => {
    if (!currentUser) return;

    try {
      setSaving(true);

      const lifestyleRef = doc(
        db,
        "users",
        currentUser.uid,
        "preferences",
        "lifestyle",
      );
      await updateDoc(
        lifestyleRef,
        {
          diet: lifestylePrefs.diet,
          exercise: lifestylePrefs.exercise,
          smoking: lifestylePrefs.smoking,
          alcohol: lifestylePrefs.alcohol,
          consultationMethod: lifestylePrefs.consultationMethod,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setNotification({
        type: "success",
        message: "Lifestyle preferences updated!",
      });
      setIsEditing((prev) => ({ ...prev, lifestyle: false }));
    } catch (error) {
      console.error("Error updating lifestyle preferences:", error);
      setNotification({
        type: "error",
        message: "Failed to update preferences",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const changePassword = async () => {
    if (!currentUser) return;

    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setNotification({
        type: "error",
        message: "New passwords do not match!",
      });
      return;
    }

    if (passwordChange.newPassword.length < 8) {
      setNotification({
        type: "error",
        message: "Password must be at least 8 characters!",
      });
      return;
    }

    try {
      setSaving(true);

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordChange.currentPassword,
      );

      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordChange.newPassword);

      setNotification({
        type: "success",
        message: "Password changed successfully!",
      });
      setPasswordChange({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsEditing((prev) => ({ ...prev, password: false }));
    } catch (error: any) {
      console.error("Error changing password:", error);
      let errorMessage = "Failed to change password";

      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      }

      setNotification({ type: "error", message: errorMessage });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const addAllergy = () => {
    const newAllergy = prompt("Enter new allergy:");
    if (newAllergy && newAllergy.trim()) {
      setMedicalInfo((prev) => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()],
      }));
    }
  };

  const removeAllergy = (index: number) => {
    setMedicalInfo((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const addChronicCondition = () => {
    const newCondition = prompt("Enter new chronic condition:");
    if (newCondition && newCondition.trim()) {
      setMedicalInfo((prev) => ({
        ...prev,
        chronicConditions: [...prev.chronicConditions, newCondition.trim()],
      }));
    }
  };

  const removeChronicCondition = (index: number) => {
    setMedicalInfo((prev) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.filter((_, i) => i !== index),
    }));
  };

  const addMedication = () => {
    const name = prompt("Enter medication name:");
    const dose = prompt("Enter dose:");
    const schedule = prompt("Enter schedule (e.g., Twice daily):");

    if (name && dose && schedule) {
      setMedicalInfo((prev) => ({
        ...prev,
        currentMedications: [
          ...prev.currentMedications,
          { name, dose, schedule },
        ],
      }));
    }
  };

  const removeMedication = (index: number) => {
    setMedicalInfo((prev) => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== index),
    }));
  };

  const addSpecialNote = () => {
    const newNote = prompt("Enter special note:");
    if (newNote && newNote.trim()) {
      setMedicalInfo((prev) => ({
        ...prev,
        specialNotes: [...prev.specialNotes, newNote.trim()],
      }));
    }
  };

  const removeSpecialNote = (index: number) => {
    setMedicalInfo((prev) => ({
      ...prev,
      specialNotes: prev.specialNotes.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar activeItem="settings" />
        <div className="ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading patient data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar activeItem="settings" />
        <div className="ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-600">Please log in to view settings</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar activeItem="settings" />

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your profile, medical information, and preferences
          </p>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : notification.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Emergency Contact */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Profile Information
                </h2>
                <button
                  onClick={() =>
                    setIsEditing((prev) => ({
                      ...prev,
                      profile: !prev.profile,
                    }))
                  }
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {isEditing.profile ? (
                    <>
                      <span>Cancel</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Edit</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100">
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      <span className="text-4xl text-blue-600 font-bold">
                        {patientProfile.fullName?.charAt(0) || "U"}
                      </span>
                    </div>
                    {isEditing.profile && (
                      <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Form */}
                <div className="flex-grow space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      {isEditing.profile ? (
                        <input
                          type="text"
                          value={patientProfile.fullName}
                          onChange={(e) =>
                            handleProfileUpdate("fullName", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={saving}
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">
                          {patientProfile.fullName || "Not set"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      {isEditing.profile ? (
                        <select
                          value={patientProfile.gender}
                          onChange={(e) =>
                            handleProfileUpdate("gender", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={saving}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">
                          {patientProfile.gender || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      {isEditing.profile ? (
                        <input
                          type="date"
                          value={patientProfile.dateOfBirth}
                          onChange={(e) =>
                            handleProfileUpdate("dateOfBirth", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={saving}
                        />
                      ) : (
                        <p className="text-gray-900">
                          {patientProfile.dateOfBirth || "Not set"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      {isEditing.profile ? (
                        <input
                          type="tel"
                          value={patientProfile.phoneNumber}
                          onChange={(e) =>
                            handleProfileUpdate("phoneNumber", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={saving}
                        />
                      ) : (
                        <p className="text-gray-900">
                          {patientProfile.phoneNumber || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <p className="text-gray-900">{patientProfile.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    {isEditing.profile ? (
                      <textarea
                        value={patientProfile.address}
                        onChange={(e) =>
                          handleProfileUpdate("address", e.target.value)
                        }
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={saving}
                      />
                    ) : (
                      <p className="text-gray-900">
                        {patientProfile.address || "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIC / Passport Number
                    </label>
                    {isEditing.profile ? (
                      <input
                        type="text"
                        value={patientProfile.nicPassport}
                        onChange={(e) =>
                          handleProfileUpdate("nicPassport", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={saving}
                      />
                    ) : (
                      <p className="text-gray-900">
                        {patientProfile.nicPassport || "Not set"}
                      </p>
                    )}
                  </div>

                  {isEditing.profile && (
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() =>
                          setIsEditing((prev) => ({ ...prev, profile: false }))
                        }
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveProfile}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Information Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Medical Summary & Health Preferences
                </h2>
                <button
                  onClick={() =>
                    setIsEditing((prev) => ({
                      ...prev,
                      medical: !prev.medical,
                    }))
                  }
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {isEditing.medical ? (
                    <>
                      <span>Cancel</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Edit</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                {/* Blood Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  {isEditing.medical ? (
                    <select
                      value={medicalInfo.bloodGroup}
                      onChange={(e) =>
                        handleMedicalInfoUpdate("bloodGroup", e.target.value)
                      }
                      className="w-full md:w-48 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={saving}
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {medicalInfo.bloodGroup || "Not set"}
                    </p>
                  )}
                </div>

                {/* Allergies */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Allergies
                    </label>
                    {isEditing.medical && (
                      <button
                        onClick={addAllergy}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center disabled:opacity-50"
                        disabled={saving}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        Add Allergy
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {medicalInfo.allergies.map((allergy, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-full"
                      >
                        <span>{allergy}</span>
                        {isEditing.medical && (
                          <button
                            onClick={() => removeAllergy(index)}
                            className="ml-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                            disabled={saving}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {medicalInfo.allergies.length === 0 && (
                      <p className="text-gray-500 italic">
                        No allergies recorded
                      </p>
                    )}
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Chronic Conditions
                    </label>
                    {isEditing.medical && (
                      <button
                        onClick={addChronicCondition}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center disabled:opacity-50"
                        disabled={saving}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        Add Condition
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {medicalInfo.chronicConditions.map((condition, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-amber-50 text-amber-700 px-3 py-1 rounded-full"
                      >
                        <span>{condition}</span>
                        {isEditing.medical && (
                          <button
                            onClick={() => removeChronicCondition(index)}
                            className="ml-2 text-amber-500 hover:text-amber-700 disabled:opacity-50"
                            disabled={saving}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {medicalInfo.chronicConditions.length === 0 && (
                      <p className="text-gray-500 italic">
                        No chronic conditions recorded
                      </p>
                    )}
                  </div>
                </div>

                {/* Current Medications */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Current Medications
                    </label>
                    {isEditing.medical && (
                      <button
                        onClick={addMedication}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center disabled:opacity-50"
                        disabled={saving}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        Add Medication
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {medicalInfo.currentMedications.map((med, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 bg-blue-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {med.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {med.dose} - {med.schedule}
                          </p>
                        </div>
                        {isEditing.medical && (
                          <button
                            onClick={() => removeMedication(index)}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            disabled={saving}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {medicalInfo.currentMedications.length === 0 && (
                      <p className="text-gray-500 italic">
                        No current medications
                      </p>
                    )}
                  </div>
                </div>

                {/* Special Notes */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Special Notes / Health Preferences
                    </label>
                    {isEditing.medical && (
                      <button
                        onClick={addSpecialNote}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center disabled:opacity-50"
                        disabled={saving}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        Add Note
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {medicalInfo.specialNotes.map((note, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 bg-green-50 rounded-lg"
                      >
                        <p className="text-gray-700">{note}</p>
                        {isEditing.medical && (
                          <button
                            onClick={() => removeSpecialNote(index)}
                            className="text-red-500 hover:text-red-700 ml-2 disabled:opacity-50"
                            disabled={saving}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {medicalInfo.specialNotes.length === 0 && (
                      <p className="text-gray-500 italic">
                        No special notes recorded
                      </p>
                    )}
                  </div>
                </div>

                {isEditing.medical && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() =>
                        setIsEditing((prev) => ({ ...prev, medical: false }))
                      }
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveMedicalInfo}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Medical Info"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Emergency Contact, Lifestyle, Password */}
          <div className="space-y-8">
            {/* Emergency Contact Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Emergency Contact
                </h2>
                <button
                  onClick={() =>
                    setIsEditing((prev) => ({
                      ...prev,
                      emergency: !prev.emergency,
                    }))
                  }
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {isEditing.emergency ? (
                    <>
                      <span>Cancel</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Edit</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name & Relationship
                  </label>
                  {isEditing.emergency ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={emergencyContact.name}
                        onChange={(e) =>
                          handleEmergencyContactUpdate("name", e.target.value)
                        }
                        placeholder="Full Name"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={saving}
                      />
                      <input
                        type="text"
                        value={emergencyContact.relationship}
                        onChange={(e) =>
                          handleEmergencyContactUpdate(
                            "relationship",
                            e.target.value,
                          )
                        }
                        placeholder="Relationship (e.g., Spouse, Parent)"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={saving}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {emergencyContact.name
                        ? `${emergencyContact.name} – ${emergencyContact.relationship}`
                        : "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  {isEditing.emergency ? (
                    <input
                      type="tel"
                      value={emergencyContact.contactNumber}
                      onChange={(e) =>
                        handleEmergencyContactUpdate(
                          "contactNumber",
                          e.target.value,
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">
                      {emergencyContact.contactNumber || "Not set"}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <p className="text-sm text-gray-500 italic">
                    Used for quick contact in case of emergencies
                  </p>
                </div>

                {isEditing.emergency && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() =>
                        setIsEditing((prev) => ({ ...prev, emergency: false }))
                      }
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEmergencyContact}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Contact"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Lifestyle Preferences Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Lifestyle Preferences
                </h2>
                <button
                  onClick={() =>
                    setIsEditing((prev) => ({
                      ...prev,
                      lifestyle: !prev.lifestyle,
                    }))
                  }
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {isEditing.lifestyle ? (
                    <>
                      <span>Cancel</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Edit</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diet Preferences
                  </label>
                  {isEditing.lifestyle ? (
                    <textarea
                      value={lifestylePrefs.diet}
                      onChange={(e) =>
                        handleLifestyleUpdate("diet", e.target.value)
                      }
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Vegetarian, Low sugar, Gluten-free"
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">
                      {lifestylePrefs.diet || "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exercise Routine
                  </label>
                  {isEditing.lifestyle ? (
                    <textarea
                      value={lifestylePrefs.exercise}
                      onChange={(e) =>
                        handleLifestyleUpdate("exercise", e.target.value)
                      }
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Light exercise 3 times a week"
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">
                      {lifestylePrefs.exercise || "Not set"}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Smoking
                    </label>
                    {isEditing.lifestyle ? (
                      <select
                        value={lifestylePrefs.smoking}
                        onChange={(e) =>
                          handleLifestyleUpdate("smoking", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={saving}
                      >
                        <option value="Non-smoker">Non-smoker</option>
                        <option value="Occasional">Occasional</option>
                        <option value="Regular">Regular</option>
                        <option value="Former smoker">Former smoker</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">
                        {lifestylePrefs.smoking || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alcohol
                    </label>
                    {isEditing.lifestyle ? (
                      <select
                        value={lifestylePrefs.alcohol}
                        onChange={(e) =>
                          handleLifestyleUpdate("alcohol", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={saving}
                      >
                        <option value="Non-drinker">Non-drinker</option>
                        <option value="Occasional">Occasional</option>
                        <option value="Social drinking">Social drinking</option>
                        <option value="Regular">Regular</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">
                        {lifestylePrefs.alcohol || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Consultation Method
                  </label>
                  {isEditing.lifestyle ? (
                    <select
                      value={lifestylePrefs.consultationMethod}
                      onChange={(e) =>
                        handleLifestyleUpdate(
                          "consultationMethod",
                          e.target.value as any,
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={saving}
                    >
                      {consultationMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {consultationMethods.find(
                        (m) => m.value === lifestylePrefs.consultationMethod,
                      )?.label || "Not set"}
                    </p>
                  )}
                </div>

                {isEditing.lifestyle && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() =>
                        setIsEditing((prev) => ({ ...prev, lifestyle: false }))
                      }
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveLifestylePrefs}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Preferences"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Change Password
                </h2>
                <button
                  onClick={() =>
                    setIsEditing((prev) => ({
                      ...prev,
                      password: !prev.password,
                    }))
                  }
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {isEditing.password ? (
                    <>
                      <span>Cancel</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Change</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {isEditing.password ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordChange.currentPassword}
                      onChange={(e) =>
                        handlePasswordUpdate("currentPassword", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordChange.newPassword}
                      onChange={(e) =>
                        handlePasswordUpdate("newPassword", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordChange.confirmPassword}
                      onChange={(e) =>
                        handlePasswordUpdate("confirmPassword", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={saving}
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    Password must be at least 8 characters long
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() =>
                        setIsEditing((prev) => ({ ...prev, password: false }))
                      }
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={changePassword}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={saving}
                    >
                      {saving ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg
                    className="w-12 h-12 text-gray-300 mx-auto mb-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                  <p className="text-gray-600">
                    Click "Change" to update your password
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => {
              // Export all data
              const data = {
                patientProfile,
                emergencyContact,
                medicalInfo,
                lifestylePrefs,
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "patient-profile-backup.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={saving}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            <span>Export Data Backup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
