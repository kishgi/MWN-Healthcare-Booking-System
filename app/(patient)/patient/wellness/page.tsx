// app/wellness/page.tsx
'use client';

import { useState } from 'react';
import WellnessPackageCard from '../../../components/PatientWellnessCard';
import Sidebar from '../../../components/PatientSidebar';

// Types (same as in WellnessPackageCard.tsx)
type PackageType = 'Nutrition' | 'Fitness' | 'Detox' | 'Stress Management' | 'Yoga' | 'Meditation' | 'Weight Loss' | 'Holistic Healing';
type PaymentStatus = 'Paid' | 'Pending' | 'Failed';

interface WellnessPackage {
  id: string;
  packageName: string;
  packageType: PackageType;
  expiryDate: string;
  totalSessions: number;
  usedSessions: number;
  packagePrice: number;
  discount: number;
  taxRate: number;
  paymentStatus: PaymentStatus;
  description?: string;
  status?: 'Active' | 'Expired' | 'Upcoming';
  progress?: number;
  category?: 'Premium' | 'Standard' | 'Basic';
  therapist?: string;
  location?: string;
}

// Helper function to format LKR currency
const formatLKR = (amount: number) => {
  return `Rs. ${amount.toLocaleString('en-LK')}`;
};

// Dummy data for packages - All prices in Sri Lankan Rupees (LKR)
const dummyPackages: WellnessPackage[] = [
  {
    id: '1',
    packageName: 'Gold Fitness Program',
    packageType: 'Fitness',
    expiryDate: '2024-12-31',
    totalSessions: 12,
    usedSessions: 5,
    packagePrice: 149997, // ~499.99 USD * 300
    discount: 15,
    taxRate: 8,
    paymentStatus: 'Paid',
    description: 'Personalized fitness training with certified trainers',
    status: 'Active',
    progress: 42,
    category: 'Premium',
    therapist: 'John Smith',
    location: 'Main Gym Center'
  },
  // NEW ACTIVE PACKAGE - Yoga & Meditation Combo
  {
    id: '13',
    packageName: 'Yoga & Meditation Combo',
    packageType: 'Yoga',
    expiryDate: '2024-11-30',
    totalSessions: 18,
    usedSessions: 7,
    packagePrice: 98997, // ~329.99 USD * 300
    discount: 15,
    taxRate: 8,
    paymentStatus: 'Paid',
    description: 'Combination of yoga and meditation for complete mind-body balance',
    status: 'Active',
    progress: 39,
    category: 'Premium',
    therapist: 'Priya Sharma',
    location: 'Zen Wellness Studio'
  },
  // NEW EXPIRED PACKAGE - Post-Injury Rehabilitation
  {
    id: '14',
    packageName: 'Post-Injury Rehabilitation',
    packageType: 'Fitness',
    expiryDate: '2023-08-10',
    totalSessions: 15,
    usedSessions: 15,
    packagePrice: 164997, // ~549.99 USD * 300
    discount: 20,
    taxRate: 8,
    paymentStatus: 'Paid',
    description: 'Specialized rehabilitation program for post-injury recovery',
    status: 'Expired',
    progress: 100,
    category: 'Premium',
    therapist: 'Dr. Benjamin Carter',
    location: 'Rehab Center'
  },
];

// Enhanced available packages with LKR prices
const availablePackages = [
  { 
    name: 'Yoga & Meditation Pro', 
    type: 'Yoga', 
    sessions: 12, 
    price: 59997, // ~199.99 USD * 300
    description: 'Advanced yoga poses and meditation techniques',
    duration: '3 months',
    rating: 4.8,
    reviews: 124
  },
  { 
    name: 'Weight Loss Transformation', 
    type: 'Weight Loss', 
    sessions: 16, 
    price: 89997, // ~299.99 USD * 300
    description: 'Complete weight loss transformation program',
    duration: '4 months',
    rating: 4.9,
    reviews: 89
  }
];

// Available package types for filter
const packageTypes: PackageType[] = ['All', 'Nutrition', 'Fitness', 'Detox', 'Stress Management', 'Yoga', 'Meditation', 'Weight Loss', 'Holistic Healing'];

export default function WellnessPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<PackageType>('All');
  const [sortBy, setSortBy] = useState<'name' | 'expiry' | 'price'>('expiry');

  // Filter packages based on active tab, search term, and type filter
  const filteredPackages = dummyPackages.filter(pkg => {
    const isExpired = new Date(pkg.expiryDate) < new Date();
    const matchesTab = activeTab === 'active' ? !isExpired : isExpired;
    const matchesSearch = pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.packageType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || pkg.packageType === filterType;
    return matchesTab && matchesSearch && matchesType;
  });

  // Sort packages
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.packageName.localeCompare(b.packageName);
      case 'price':
        return b.packagePrice - a.packagePrice;
      case 'expiry':
      default:
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    }
  });

  // Calculate totals with more metrics
  const activePackages = dummyPackages.filter(pkg => new Date(pkg.expiryDate) >= new Date());
  const totalActivePackages = activePackages.length;
  const totalRemainingSessions = activePackages.reduce((sum, pkg) => sum + (pkg.totalSessions - pkg.usedSessions), 0);
  const totalInvestment = dummyPackages.reduce((sum, pkg) => sum + pkg.packagePrice, 0);
  const expiringSoon = activePackages.filter(pkg => {
    const daysUntilExpiry = Math.ceil((new Date(pkg.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  }).length;

  const handleUnenroll = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowUnenrollModal(true);
  };

  const confirmUnenroll = () => {
    console.log(`Unenrolling package: ${selectedPackage}`);
    // In a real app, you would make an API call here
    setShowUnenrollModal(false);
    setSelectedPackage('');
  };

  const handleFindMorePackages = () => {
    console.log('Navigating to package marketplace');
    // In a real app, you would navigate to a marketplace page
  };

  const handleAddPackage = (packageName: string) => {
    alert(`Added ${packageName} to cart!`);
    // In a real app, you would add to cart or initiate purchase
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar 
        totalRemainingSessions={totalRemainingSessions}
        activeItem="packages"
      />

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Wellness Packages</h1>
              <p className="text-gray-600 mt-2">Manage your wellness journey and track your progress</p>
            </div>
            <button
              onClick={handleFindMorePackages}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span>Find More Packages</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Active Packages</p>
                  <p className="text-3xl font-bold text-gray-800">{totalActivePackages}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Remaining Sessions</p>
                  <p className="text-3xl font-bold text-gray-800">{totalRemainingSessions}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 6v2h14V6H5zm2 4h10v2H7zm0 4h7v2H7z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Expiring Soon</p>
                  <p className="text-3xl font-bold text-gray-800">{expiringSoon}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total Investment</p>
                  <p className="text-3xl font-bold text-gray-800">Rs. {totalInvestment.toLocaleString('en-LK')}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border">
          <div className="relative w-full md:w-96 mb-4 md:mb-0 text-black">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search packages by name, type, or description..."
              className="text-black pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'active'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('active')}
              >
                Active Packages ({totalActivePackages})
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'expired'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('expired')}
              >
                Expired Packages ({dummyPackages.length - totalActivePackages})
              </button>
            </div>

            <div className="flex items-center space-x-2 text-black">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as PackageType)}
              >
                {packageTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'All' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 text-black">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'expiry' | 'price')}
              >
                <option value="expiry">Sort by Expiry</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {activeTab === 'active' ? 'Active Packages' : 'Expired Packages'}
            <span className="text-gray-600 text-lg font-normal ml-2">({sortedPackages.length} found)</span>
          </h2>
          
          {sortedPackages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No {activeTab === 'active' ? 'active' : 'expired'} packages found
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'active'
                  ? "You don't have any active wellness packages matching your criteria."
                  : "You don't have any expired packages matching your criteria."}
              </p>
              {activeTab === 'active' && (
                <button
                  onClick={handleFindMorePackages}
                  className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  <span>Browse Available Packages</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPackages.map((pkg) => (
                <div key={pkg.id} className="relative group">
                  <WellnessPackageCard package={pkg} />
                  {activeTab === 'active' && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleUnenroll(pkg.id)}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-md hover:bg-white transition-colors"
                        title="Unenroll from package"
                      >
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Packages Section */}
        {activeTab === 'active' && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Available Packages</h2>
                <p className="text-gray-600 mt-1">Discover new wellness experiences</p>
              </div>
              <button
                onClick={handleFindMorePackages}
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center space-x-2"
              >
                <span>View All Packages</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {availablePackages.map((pkg, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {pkg.type}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">Rs. {pkg.price.toLocaleString('en-LK')}</div>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        {pkg.rating} ({pkg.reviews} reviews)
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{pkg.duration}</div>
                  </div>
                  <button 
                    onClick={() => handleAddPackage(pkg.name)}
                    className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    Add Package
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unenroll Modal */}
      {showUnenrollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Unenrollment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to unenroll from this package? Any remaining sessions will be forfeited and cannot be refunded.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowUnenrollModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnenroll}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Yes, Unenroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}