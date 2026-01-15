'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Package, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  HelpCircle,
  Heart
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/patient/dashboard',
      badge: null
    },
    { 
      icon: Calendar, 
      label: 'My Appointments', 
      href: '/patient/appointments',
      
    },
    { 
      icon: FileText, 
      label: 'My Health Records', 
      href: '/patient/records',
      badge: null
    },
    { 
      icon: Package, 
      label: 'Wellness Packages', 
      href: '/patient/wellness',
     
    },
    { 
      icon: CreditCard, 
      label: 'Billing & Payments', 
      href: '/patient/billing',
      badge: null
    },
    { 
      icon: Settings, 
      label: 'Profile Settings', 
      href: '/patient/settings',
      badge: null
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-100"
      >
        {isMobileSidebarOpen ? (
          <X className="h-5 w-5 text-gray-700" />
        ) : (
          <Menu className="h-5 w-5 text-gray-700" />
        )}
      </button>

      {/* Desktop Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        title="Toggle Sidebar"
        className="hidden lg:block absolute -right-3 top-24 z-10 p-1.5 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
      >
        <ChevronRight className={`h-4 w-4 text-gray-600 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
        fixed top-0 left-0 h-screen bg-gradient-to-b from-white to-gray-50 border-r border-gray-100
  shadow-xl lg:shadow-sm z-40 transition-all duration-300 ease-in-out
      `}>
        {/* MWN Logo Header */}
        <Link href="/" className="block">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A8F7A] to-[#06D6A0] flex items-center justify-center shadow-sm">
              <Heart className="h-6 w-6 text-white" />
            </div>
            
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900">MWN</h2>
                <p className="text-sm text-gray-600">MediCare Wellness Network</p>
              </div>
            )}
          </div>
        </div>
        </Link>
        

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`
                  flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                  ${active 
                    ? 'bg-gradient-to-r from-[#0A8F7A]/10 to-[#06D6A0]/10 text-[#0A8F7A] border border-[#0A8F7A]/20' 
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[#0A8F7A]'
                  }
                `}
              >
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-lg
                  ${active 
                    ? 'bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white' 
                    : 'bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-[#0A8F7A]/10 group-hover:to-[#06D6A0]/10 text-gray-600 group-hover:text-[#0A8F7A]'
                  }
                `}>
                  <item.icon className="h-4 w-4" />
                </div>
                
                {isSidebarOpen && (
                  <>
                    <span className="ml-3 font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${item.badge === 'New' 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                          : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                    {active && (
                      <div className="w-1 h-6 bg-gradient-to-b from-[#0A8F7A] to-[#06D6A0] rounded-full ml-2"></div>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-100 space-y-4">
          {/* Help Center */}
          {isSidebarOpen && (
            <Link
              href="/help"
              className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[#0A8F7A] transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-[#0A8F7A]/10 group-hover:to-[#06D6A0]/10 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-gray-600 group-hover:text-[#0A8F7A]" />
              </div>
              <span className="ml-3 font-medium">Help Center</span>
            </Link>
          )}

          {/* Logout Button */}
          <button
            onClick={() => {
              // Handle logout logic here
              console.log('Logout clicked');
            }}
            className={`
              w-full flex items-center px-4 py-3 rounded-xl text-gray-700
              hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600
              transition-all duration-200 group
            `}
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-red-100 group-hover:to-red-50 flex items-center justify-center">
              <LogOut className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
            </div>
            {isSidebarOpen && (
              <span className="ml-3 font-medium">Logout</span>
            )}
          </button>

          {/* Copyright */}
          {isSidebarOpen && (
            <div className="px-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                &copy; {new Date().getFullYear()} MWN Healthcare
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;