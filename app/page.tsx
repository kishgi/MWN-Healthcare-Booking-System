import Navbar from "./components/Navbar";
import FeatureCard from "./components/FeatureCard";
import Footer from "./components/Footer";
import {
  Calendar,
  FileText,
  Package,
  Cloud,
  Clock,
  Users,
  Shield,
  Activity,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: Calendar,
      title: "Smart Appointment Management",
      description:
        "Book, reschedule, and manage appointments across all MWN branches with real-time doctor availability and no double-booking.",
      gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      icon: FileText,
      title: "Centralized Patient Health Profiles",
      description:
        "Securely store and access patient medical history, lifestyle data, lab reports, and consultation notes from any clinic.",
      gradient: "bg-gradient-to-r from-emerald-500 to-green-500",
    },
    {
      icon: Package,
      title: "Wellness Packages & Smart Billing",
      description:
        "Manage Nutrition, Fitness, Detox, and Stress Management packages with automated discounts, session tracking, and tax-ready billing.",
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
    },

    {
      icon: Shield,
      title: "Medical-Grade Data Security",
      description:
        "Encrypted patient records, secure logins, and full audit logs to meet healthcare data protection standards.",
      gradient: "bg-gradient-to-r from-teal-500 to-sky-500",
    },
  ];

  const stats = [
    { icon: Users, value: "50,000+", label: "Patients Served" },
    { icon: Clock, value: "24/7", label: "Support Available" },
    { icon: Shield, value: "100%", label: "HIPAA Compliant" },
    { icon: Activity, value: "15+", label: "Specialty Clinics" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-emerald-50/30 bg-[#F2F9FF]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#FBFBFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pt-20 md:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-medium mb-6">
                <Activity className="h-4 w-4 mr-2" />
                Trusted Healthcare Since 2010
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Your Health,
                <span className="block bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  Our Priority
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                Book appointments, manage wellness programs, and access your
                health records securely across all MediCare Wellness Network
                clinics.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href='/patient/appointments'>
                <button className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Book Appointment
                </button>
                </Link>
                
                <Link href="/login" className="">
                <button className="cursor-pointer px-8 py-3.5 bg-white text-blue-600 font-semibold border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md">
                  Login to Portal
                </button>
                </Link>
                
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                  No wait times
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  Multi-branch access
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                  Insurance accepted
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <img
                src="/hero1.png"
                alt="Friendly doctor consulting with patient in modern healthcare setting"
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
              />

              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-blue-500/10"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-emerald-500/10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-emerald-500  rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50 mb-4">
                    <stat.icon className="h-7 w-7 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
              {/* <span className="block text-blue-600">Management Platform</span> */}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A secure, cloud-based system for managing patients, appointments,
              and wellness services across all MediCare Wellness Network
              clinics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Experience Better Healthcare?
            </h2>
            <p className="text-xl text-blue-50/90 max-w-2xl mx-auto mb-10">
              Join thousands of patients who trust MediCare Wellness Network for
              their healthcare needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors duration-200">
                Get Started Today
              </button>
              <button className="px-8 py-3.5 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors duration-200">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
