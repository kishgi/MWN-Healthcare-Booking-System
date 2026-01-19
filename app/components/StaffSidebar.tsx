"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  Menu,
  X,
  Phone,
  Building,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/app/firebase/auth"; // Adjust path as needed

interface StaffSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  active?: boolean;
  subItems?: {
    label: string;
    href: string;
  }[];
}

// Interface for staff data from Firestore
interface StaffData {
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  branch?: string;
  staffId?: string;
  userId?: string;
}

const StaffSidebar = ({ isCollapsed = false, onToggle }: StaffSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [loggingOut, setLoggingOut] = useState(false);

  // Get staff data from localStorage (set after login)
  const getStaffData = (): StaffData | null => {
    if (typeof window !== "undefined") {
      const staffData = localStorage.getItem("staff_data");
      return staffData ? JSON.parse(staffData) : null;
    }
    return null;
  };

  const staffData = getStaffData();

  // Define menu items with href patterns
  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/staff/dashboard",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: <Calendar className="w-5 h-5" />,
      href: "/staff/appointments",
    },
    {
      id: "patients",
      label: "Patients",
      icon: <Users className="w-5 h-5" />,
      href: "/staff/patients",
    },
    {
      id: "wellness-packages",
      label: "Wellness Packages",
      icon: <Package className="w-5 h-5" />,
      href: "/staff/wellnesspackages",
    },
  ];

  // Update active item based on current route
  useEffect(() => {
    // Find which menu item matches the current path
    const currentPath = pathname || "";

    // Check exact matches first
    const exactMatch = menuItems.find((item) => item.href === currentPath);
    if (exactMatch) {
      setActiveItem(exactMatch.id);
      return;
    }

    // Check for partial matches (for nested routes)
    const partialMatch = menuItems.find(
      (item) =>
        currentPath.startsWith(item.href) && item.href !== "/staff/dashboard",
    );

    if (partialMatch) {
      setActiveItem(partialMatch.id);
    } else {
      // Default to dashboard if no match
      setActiveItem("dashboard");
    }
  }, [pathname]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    if (onToggle) onToggle();
  };

  const handleItemClick = (id: string, href: string) => {
    setActiveItem(id);
    router.push(href);
    if (mobileOpen) setMobileOpen(false);
  };

  // Enhanced logout function with Firebase integration
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }

    setLoggingOut(true);

    try {
      // 1. Call Firebase logout
      await logout();

      // 2. Clear all local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("staff_data");
        localStorage.removeItem("user_role");
        localStorage.removeItem("session_expiry");
        localStorage.removeItem("firebase_auth_state");

        // Clear session storage
        sessionStorage.clear();

        // Clear cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/",
            );
        });
      }

      // 3. Clear any Firebase auth state listeners
      window.dispatchEvent(new Event("auth-state-changed"));

      // 4. Redirect to login page
      router.push("/staff/login");

      // Force a hard redirect to ensure all state is cleared
      setTimeout(() => {
        window.location.href = "/staff/login";
      }, 100);
    } catch (error: any) {
      console.error("Logout error:", error);

      // Even if Firebase logout fails, clear local data and redirect
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      router.push("/staff/login");
      setTimeout(() => {
        window.location.href = "/staff/login";
      }, 100);
    } finally {
      setLoggingOut(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!staffData) return "US";

    const name = staffData.fullName || staffData.name || "User";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get user name
  const getUserName = () => {
    if (!staffData) return "Staff User";
    return staffData.fullName || staffData.name || "Staff User";
  };

  // Get user role
  const getUserRole = () => {
    if (!staffData) return "Staff";
    return staffData.role || "Staff";
  };

  // Get department
  const getDepartment = () => {
    if (!staffData) return "";
    return staffData.department || "";
  };

  // Get branch
  const getBranch = () => {
    if (!staffData) return "Colombo Branch";
    return staffData.branch || "Colombo Branch";
  };

  // Get staff ID
  const getStaffId = () => {
    if (!staffData) return "STF-001";
    return staffData.staffId || "STF-001";
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-white rounded-lg shadow-md border border-gray-200"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 
          flex flex-col z-40 transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">MWN</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      MWN Healthcare
                    </h1>
                    <p className="text-xs text-gray-500">Staff Portal</p>
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] rounded-lg flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-lg">MWN</span>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Profile Section - Expanded */}
        {!collapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {getUserInitials()}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{getUserName()}</h3>
                <p className="text-sm text-gray-600">
                  {getUserRole()} • {getDepartment()}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {getStaffId()}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {getBranch()}
                  </span>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsed Profile */}
        {collapsed && (
          <div className="p-4 border-b border-gray-200 flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {getUserInitials()}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeItem === item.id;
              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id, item.href)}
                    className={`
                      flex items-center w-full px-4 py-3 rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-600 border-r-4 border-blue-500"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <div className="relative">
                      {item.icon}
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <>
                        <span className="ml-3 font-medium">{item.label}</span>
                        {item.badge && !isActive && (
                          <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  {/* Sub-items */}
                  {item.subItems && !collapsed && isActive && (
                    <div className="ml-12 mt-2 space-y-1">
                      {item.subItems.map((subItem, index) => (
                        <a
                          key={index}
                          href={subItem.href}
                          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                        >
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200">
          {!collapsed && (
            <div className="space-y-2">
              <a
                href="/staff/settings"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="ml-3 font-medium">Settings</span>
              </a>

              {/* Logout Button with loading state */}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                  loggingOut
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "text-red-600 hover:bg-red-50"
                }`}
              >
                {loggingOut ? (
                  <>
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 font-medium">Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-5 h-5" />
                    <span className="ml-3 font-medium">Logout</span>
                  </>
                )}
              </button>

              {/* Quick Contact Info */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Phone className="w-3 h-3 mr-1" />
                  <span>Emergency: +94 117</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Building className="w-3 h-3 mr-1" />
                  <span>24/7 Service Available</span>
                </div>
                <p className="text-xs text-gray-500 text-center pt-2">
                  v2.1.0 • © 2024 MWN Healthcare
                </p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="flex flex-col items-center space-y-2">
              <a
                href="/staff/settings"
                className="p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </a>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className={`p-3 rounded-lg transition-colors ${
                  loggingOut
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "text-red-600 hover:bg-red-50"
                }`}
                title={loggingOut ? "Logging out..." : "Logout"}
              >
                {loggingOut ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Spacer for fixed sidebar */}
      <div className={`hidden lg:block ${collapsed ? "w-20" : "w-64"}`} />
    </>
  );
};

export default StaffSidebar;
