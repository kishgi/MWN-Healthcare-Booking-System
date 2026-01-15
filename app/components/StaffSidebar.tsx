'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  FileText,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import Image from 'next/image';

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

const StaffSidebar = ({ isCollapsed = false, onToggle }: StaffSidebarProps) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/staff/dashboard',
      active: activeItem === 'dashboard',
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <Calendar className="w-5 h-5" />,
      href: '/staff/appointments',
      active: activeItem === 'appointments',
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: <Users className="w-5 h-5" />,
      href: '/staff/patients',
      active: activeItem === 'patients',
    },
    {
      id: 'wellness-packages',
      label: 'Wellness Packages',
      icon: <Package className="w-5 h-5" />,
      href: '/staff/wellnesspackages',
      active: activeItem === 'wellness-packages',
      subItems: [
        { label: 'All Packages', href: '/staff/wellness-packages' },
        { label: 'Create New', href: '/staff/wellness-packages/create' },
        { label: 'Categories', href: '/staff/wellness-packages/categories' }
      ]
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: <CreditCard className="w-5 h-5" />,
      href: '/staff/billing',
      active: activeItem === 'billing',
      subItems: [
        { label: 'Invoices', href: '/staff/billing/invoices' },
        { label: 'Payments', href: '/staff/billing/payments' },
        { label: 'Reports', href: '/staff/billing/reports' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/staff/reports',
      active: activeItem === 'reports'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileText className="w-5 h-5" />,
      href: '/staff/documents',
      active: activeItem === 'documents'
    }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    if (onToggle) onToggle();
  };

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    if (mobileOpen) setMobileOpen(false);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // Handle logout logic
      console.log('Logging out...');
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-white rounded-lg shadow-md border border-gray-200"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
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
                    <h1 className="text-xl font-bold text-gray-900">MWN Healthcare</h1>
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
                <div className="w-5 h-5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] rounded-lg flex items-center justify-center mb-2">
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

      

        {/* Collapsed Profile */}
        {collapsed && (
          <div className="p-4 border-b border-gray-200 flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                JD
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <a
                  href={item.href}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-colors
                    ${item.active 
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-500' 
                      : 'text-gray-700 hover:bg-gray-100'
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
                      {item.badge && !item.active && (
                        <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </a>
                
                {/* Sub-items */}
                {item.subItems && !collapsed && item.active && (
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
            ))}
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
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-3 font-medium">Logout</span>
              </button>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  v2.1.0 • © 2024 MWN
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
                className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Spacer for fixed sidebar */}
      <div className={`hidden lg:block ${collapsed ? 'w-20' : 'w-64'}`} />
    </>
  );
};

export default StaffSidebar;

// Example usage in a layout
export const StaffLayoutExample = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffSidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content Area */}
      <main className="lg:ml-64 lg:ml-20">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Staff Dashboard</h1>
            
            {/* Dashboard content goes here */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Total Appointments</h3>
                <p className="text-3xl font-bold text-gray-900">156</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Active Patients</h3>
                <p className="text-3xl font-bold text-gray-900">89</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Revenue</h3>
                <p className="text-3xl font-bold text-gray-900">$12,450</p>
              </div>
            </div>

            {/* More content... */}
          </div>
        </div>
      </main>
    </div>
  );
};