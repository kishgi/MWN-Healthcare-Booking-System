'use client';

import { useState } from 'react';
import { 
  Menu, 
  X, 
  Stethoscope, 
  ChevronDown, 
  Phone, 
  Calendar, 
  FileText, 
  Users,
  User,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // UI state for logged in user (no real auth integration)
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Change to true to see logged in state
  const [userProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Patient',
    avatarInitials: 'JD'
  });

  const navItems = [
    { label: 'Home', href: '/' },
    { 
      label: 'Services', 
      href: '/services',
      dropdown: [
        { icon: Calendar, label: 'Appointment Booking', href: '/patient/appointments' },
        { icon: Users, label: 'Wellness Experts', href: '/wellnessexperts' },
        { icon: Users, label: 'Wellness Programs', href: '/wellnessprograms' },
      ]
    },
    { label: 'Book Appointment', href: '/patient/appointments', icon: Calendar },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const profileMenuItems = [
    { icon: User, label: 'My Profile', href: '/patient/profile' },
    { icon: Settings, label: 'Settings', href: '/patient/settings' },
    { icon: Bell, label: 'Notifications', href: '/patient/notifications' },
    { icon: LogOut, label: 'Logout', href: '/logout', onClick: () => setIsLoggedIn(false) }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
              <div className="relative bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] p-2 rounded-xl">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-2xl font-bold bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] bg-clip-text text-transparent">
                MediCare
              </div>
              <div className="text-sm font-medium text-gray-600 -mt-1">Wellness Network</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.dropdown ? (
                  <button 
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                    className="flex items-center px-4 py-2.5 text-gray-700 hover:text-[#0A8F7A] font-medium transition-all duration-200 group relative"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center px-4 py-2.5 text-gray-700 hover:text-[#0A8F7A] font-medium transition-all duration-200 group relative"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                  </Link>
                )}
                
                {/* Dropdown Menu */}
                {item.dropdown && isServicesOpen && (
                  <div 
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                    className="absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in"
                  >
                    {item.dropdown.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.label}
                        href={dropdownItem.href}
                        className="flex items-center px-4 py-3 text-gray-700 hover:text-[#0A8F7A] hover:bg-gradient-to-r hover:from-[#D6F4ED]/30 hover:to-[#C0F0E5]/30 transition-all duration-200 group"
                      >
                        <dropdownItem.icon className="h-4 w-4 mr-3 text-[#0A8F7A]/60 group-hover:text-[#0A8F7A]" />
                        <span>{dropdownItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons / Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              // Logged in user - Profile dropdown
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-[#D6F4ED]/20 hover:to-[#C0F0E5]/20 transition-all duration-200 group"
                >
                  {/* Notification Bell */}
                  <div className="relative">
                    <Bell className="h-5 w-5 text-gray-600 group-hover:text-[#0A8F7A]" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  </div>
                  
                  {/* User Avatar */}
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{userProfile.avatarInitials}</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 text-sm">{userProfile.name}</div>
                      <div className="text-xs text-gray-500">{userProfile.role}</div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div 
                    onMouseEnter={() => setIsProfileOpen(true)}
                    onMouseLeave={() => setIsProfileOpen(false)}
                    className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in"
                  >
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{userProfile.avatarInitials}</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{userProfile.name}</div>
                          <div className="text-sm text-gray-600">{userProfile.email}</div>
                          <div className="text-xs text-[#0A8F7A] font-medium mt-1">{userProfile.role}</div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Menu Items */}
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => {
                          setIsProfileOpen(false);
                          if (item.onClick) item.onClick();
                        }}
                        className="flex items-center px-4 py-3 text-gray-700 hover:text-[#0A8F7A] hover:bg-gradient-to-r hover:from-[#D6F4ED]/20 hover:to-[#C0F0E5]/20 transition-all duration-200 group"
                      >
                        <item.icon className="h-4 w-4 mr-3 text-gray-500 group-hover:text-[#0A8F7A]" />
                        <span>{item.label}</span>
                        {item.label === 'Notifications' && (
                          <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Not logged in - Auth buttons
              <>
                <Link 
                  href="/login" 
                  className="relative px-6 py-2.5 text-[#0A8F7A] font-medium rounded-lg overflow-hidden group transition-all duration-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D6F4ED]/0 via-[#C0F0E5]/0 to-[#A3E4D8]/0 group-hover:from-[#D6F4ED]/20 group-hover:via-[#C0F0E5]/20 group-hover:to-[#A3E4D8]/20 transition-all duration-300"></div>
                  <span className="relative z-10">Login</span>
                  <div className="absolute inset-0 border border-[#0A8F7A]/20 rounded-lg group-hover:border-[#0A8F7A]/40 transition-colors duration-200"></div>
                </Link>
                <Link 
                  href="/register" 
                  className="relative px-6 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-lg overflow-hidden group hover:shadow-lg hover:shadow-[#0A8F7A]/20 transition-all duration-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A8F7A]/0 via-[#06D6A0]/0 to-[#0A8F7A]/0 group-hover:from-[#0A8F7A] group-hover:via-[#06D6A0] group-hover:to-[#0A8F7A] transition-all duration-300"></div>
                  <span className="relative z-10">Register</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-[#D6F4ED]/30 hover:to-[#C0F0E5]/30 transition-all duration-200"
          >
            <div className="relative">
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-down mt-2 rounded-xl bg-white/95 backdrop-blur-lg shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-2 pt-2 pb-4">
              {/* User Info in Mobile Menu if logged in */}
              {isLoggedIn && (
                <div className="px-4 py-4 border-b border-gray-100 mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{userProfile.avatarInitials}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{userProfile.name}</div>
                      <div className="text-sm text-gray-600">{userProfile.email}</div>
                      <div className="text-xs text-[#0A8F7A] font-medium mt-1">{userProfile.role}</div>
                    </div>
                  </div>
                </div>
              )}

              {navItems.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3.5 text-gray-700 hover:text-[#0A8F7A] hover:bg-gradient-to-r hover:from-[#D6F4ED]/20 hover:to-[#C0F0E5]/20 rounded-lg transition-all duration-200 group"
                  >
                    {item.icon && <item.icon className="h-5 w-5 mr-3 text-[#0A8F7A]/60" />}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                  {item.dropdown && (
                    <div className="ml-8 mr-2 mt-1 space-y-1">
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.label}
                          href={dropdownItem.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:text-[#0A8F7A] hover:bg-gradient-to-r hover:from-[#D6F4ED]/10 hover:to-[#C0F0E5]/10 rounded-lg transition-all duration-200 group"
                        >
                          <dropdownItem.icon className="h-4 w-4 mr-3 text-[#0A8F7A]/40" />
                          <span>{dropdownItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                {isLoggedIn ? (
                  // Logged in mobile menu items
                  <>
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => {
                          setIsMenuOpen(false);
                          if (item.onClick) item.onClick();
                        }}
                        className="flex items-center px-4 py-3.5 text-gray-700 hover:text-[#0A8F7A] hover:bg-gradient-to-r hover:from-[#D6F4ED]/20 hover:to-[#C0F0E5]/20 rounded-lg transition-all duration-200 group"
                      >
                        <item.icon className="h-5 w-5 mr-3 text-gray-500" />
                        <span className="font-medium">{item.label}</span>
                        {item.label === 'Notifications' && (
                          <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </Link>
                    ))}
                  </>
                ) : (
                  // Not logged in mobile menu items
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full px-4 py-3.5 text-center text-[#0A8F7A] font-medium rounded-lg border border-[#0A8F7A]/20 hover:bg-gradient-to-r hover:from-[#D6F4ED]/20 hover:to-[#C0F0E5]/20 transition-all duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full px-4 py-3.5 text-center bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#0A8F7A]/20 transition-all duration-200"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;