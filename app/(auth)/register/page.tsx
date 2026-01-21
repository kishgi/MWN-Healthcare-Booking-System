"use client";

import { useState } from "react";
import { Eye, EyeOff, User, Mail, Phone, Lock, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  registerWithEmail,
  signInWithGoogle,
  UserRole,
} from "@/app/firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    mobile: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
    role: UserRole;
  }>({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    role: "patient",
  });

  const [errors, setErrors] = useState<{
    fullName: string;
    email: string;
    mobile: string;
    password: string;
    confirmPassword: string;
    acceptTerms: string;
    role: string;
  }>({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    acceptTerms: "",
    role: "",
  });

  // ---------------- Password Strength ----------------
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  // ---------------- Input Handlers ----------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target;
    const name = target.name;
    let value: string | boolean = "";

    if (target instanceof HTMLInputElement) {
      value = target.type === "checkbox" ? target.checked : target.value;
    } else if (target instanceof HTMLSelectElement) {
      value = target.value;
    }

    setFormData({ ...formData, [name]: value });

    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: "" });
    }

    if (name === "password" && typeof value === "string") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // keep only digits
    if (value.length > 10) value = value.slice(0, 10); // max 10 digits
    setFormData({ ...formData, mobile: value });

    if (errors.mobile) setErrors({ ...errors, mobile: "" });
  };

  // ---------------- Validation ----------------
  const validateForm = () => {
    const newErrors: typeof errors = {
      fullName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      acceptTerms: "",
      role: "",
    };

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (formData.fullName.trim().length < 2)
      newErrors.fullName = "Full name must be at least 2 characters";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Please enter a valid email address";

    const mobileRegex = /^[0-9]{10}$/; // 10 digits
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    else if (!mobileRegex.test(formData.mobile))
      newErrors.mobile = "Please enter a valid 10-digit mobile number";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    else if (!/[a-z]/.test(formData.password))
      newErrors.password = "Password must contain one lowercase letter";
    else if (!/[A-Z]/.test(formData.password))
      newErrors.password = "Password must contain one uppercase letter";
    else if (
      !/[0-9]/.test(formData.password) &&
      !/[^A-Za-z0-9]/.test(formData.password)
    )
      newErrors.password =
        "Password must contain a number or special character";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.acceptTerms)
      newErrors.acceptTerms = "You must accept the terms to continue";

    if (!formData.role) newErrors.role = "Please select a role";

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  // ---------------- Submit Handlers ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const db = getFirestore();

      // --- Check email uniqueness ---
      const emailQuery = query(
        collection(db, "users"),
        where("email", "==", formData.email),
      );
      const emailSnap = await getDocs(emailQuery);
      if (!emailSnap.empty) {
        setErrors((prev) => ({
          ...prev,
          email: "Email is already registered",
        }));
        setIsSubmitting(false);
        return;
      }

      // --- Check mobile uniqueness ---
      const mobileQuery = query(
        collection(db, "users"),
        where("mobile", "==", formData.mobile),
      );
      const mobileSnap = await getDocs(mobileQuery);
      if (!mobileSnap.empty) {
        setErrors((prev) => ({
          ...prev,
          mobile: "Mobile number is already registered",
        }));
        setIsSubmitting(false);
        return;
      }

      // --- Register user ---
      await registerWithEmail(
        formData.fullName,
        formData.email,
        formData.password,
        formData.mobile,
        formData.role,
      );

      alert("Registration successful!");
      router.push(`/${formData.role}/dashboard`);
    } catch (error: any) {
      console.error(error);
      alert("Registration failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!formData.role) {
      alert("Please select a role first");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithGoogle(formData.role);
      alert("Google Sign-Up successful!");
      router.push(`/${formData.role}/dashboard`);
    } catch (error: any) {
      console.error(error);
      alert("Google Sign-Up failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- Render ----------------
  return (
    <div className="min-h-screen flex text-black">
      <div className="w-full lg:w-1/2 bg-gradient-to-b from-blue-50 via-white to-emerald-50 flex flex-col justify-center p-8 lg:p-12">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-500 p-2 rounded-xl">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] bg-clip-text text-transparent">
                  MediCare Wellness Network
                </div>
                <p className="text-emerald-600 text-sm">Patient Registration</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Create Your Account
            </h2>
          </div>

          {/* Optional Google Signup */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isSubmitting}
            className="w-full py-3 mb-4 border rounded-xl bg-white hover:bg-gray-100 flex justify-center items-center space-x-2 transition"
          >
            {/* <img src="/google-logo.png" className="h-5 w-5" alt="Google Logo" /> */}
            <span>Sign up with Google (Optional)</span>
          </button>

          <div className="flex items-center mb-4">
            <hr className="flex-1 border-gray-300" />
            <span className="mx-2 text-gray-400 text-sm">OR</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="block w-full pl-3 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-3 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleMobileChange}
                className="block w-full pl-3 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="0123456789"
              />
              {errors.mobile && (
                <p className="mt-2 text-sm text-red-600">{errors.mobile}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full pl-3 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-2 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                I accept the terms and conditions
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="mt-2 text-sm text-red-600">{errors.acceptTerms}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-emerald-600 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-blue-600/90 to-emerald-600/90">
        <img
          src="/loginImage.png"
          alt="Doctor consulting patient"
          className="mt-30"
        />
      </div>
    </div>
  );
}
