"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Heart, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  loginWithEmail,
  signInWithGoogle,
  UserRole,
} from "@/app/firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state with role
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    role: UserRole;
  }>({
    email: "",
    password: "",
    role: "patient",
  });

  const [errors, setErrors] = useState<{
    email: string;
    password: string;
    general: string;
  }>({
    email: "",
    password: "",
    general: "",
  });

  // ---------------- Handlers ----------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target;
    const name = target.name;

    let value: string | boolean = "";

    if (target instanceof HTMLInputElement) {
      value = target.value;
    } else if (target instanceof HTMLSelectElement) {
      value = target.value;
    }

    setFormData({ ...formData, [name]: value });

    if (errors[name as keyof typeof errors])
      setErrors({ ...errors, [name]: "" });
    if (errors.general) setErrors({ ...errors, general: "" });
  };

  // ---------------- Validation ----------------
  const validate = () => {
    const newErrors = { email: "", password: "", general: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === "");
  };

  // ---------------- Submit ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const user = await loginWithEmail(formData.email, formData.password);
      console.log("Logged in:", user);
      router.push(`/${formData.role}/dashboard`); // redirect based on role
    } catch (err: any) {
      console.error("Login failed:", err);
      setErrors({ ...errors, general: err.message || "Login failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- Google Login ----------------
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle(formData.role); // Pass role explicitly
      router.push(`/${formData.role}/dashboard`);
    } catch (err: any) {
      console.error("Google login failed:", err);
      setErrors({ ...errors, general: err.message || "Google login failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- Render ----------------
  return (
    <div className="min-h-screen flex text-black">
      {/* Left Form */}
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
                <p className="text-emerald-600 text-sm">Patient Login</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Welcome Back!
            </h2>
            {errors.general && (
              <p className="mb-4 text-sm text-red-600">{errors.general}</p>
            )}
          </div>

          {/* Google login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-3 mb-4 border rounded-xl bg-white hover:bg-gray-100 flex justify-center items-center space-x-2 transition"
          >
            {/* <img src="/google-logo.png" className="h-5 w-5" alt="Google Logo" /> */}
            <span>Login with Google</span>
          </button>

          <div className="flex items-center mb-4">
            <hr className="flex-1 border-gray-300" />
            <span className="mx-2 text-gray-400 text-sm">OR</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          {/* Email login */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? "border-red-300" : "border-gray-200"
                  } rounded-xl bg-white focus:outline-none focus:ring-2 ${
                    errors.email ? "focus:ring-red-500" : "focus:ring-blue-500"
                  } focus:border-transparent transition-all duration-200`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 border ${
                    errors.password ? "border-red-300" : "border-gray-200"
                  } rounded-xl bg-white focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "focus:ring-red-500"
                      : "focus:ring-blue-500"
                  } focus:border-transparent transition-all duration-200`}
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

            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-emerald-600 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side Image */}
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
