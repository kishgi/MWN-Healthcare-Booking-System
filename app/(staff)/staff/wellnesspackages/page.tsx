'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../../components/StaffSidebar';
import { 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Star,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MoreVertical,
  Bell,
  ChevronLeft,
  ChevronRight,
  Filter as FilterIcon,
  Plus,
  X,
  Heart,
  Activity,
  Shield,
  Award,
  TrendingUp,
  Zap,
  Package,
  Gift,
  Crown,
  Sparkles,
  Target,
  Brain,
  Dumbbell,
  Apple
} from 'lucide-react';

// Types
type PackageStatus = 'active' | 'inactive' | 'upcoming';
type PackageType = 'basic' | 'premium' | 'corporate' | 'family' | 'senior';
type PackageCategory = 'fitness' | 'nutrition' | 'mental_health' | 'preventive' | 'comprehensive';

interface WellnessPackage {
  id: string;
  name: string;
  description: string;
  type: PackageType;
  category: PackageCategory;
  duration: number; // in months
  price: number;
  discountedPrice?: number;
  discountPercentage?: number;
  features: string[];
  inclusions: string[];
  targetAudience: string[];
  status: PackageStatus;
  popularity: number; // 1-5
  recommendedFor: string[];
  maxMembers?: number;
  registrationDate: string;
  validityPeriod: {
    start: string;
    end: string;
  };
  createdAt: string;
  updatedAt: string;
  salesCount: number;
  rating: number;
  totalConsultations: number;
  labTestsIncluded: number;
  fitnessSessions: number;
  dietarySessions: number;
  specialistVisits: number;
}

export default function WellnessPackagesPage() {
  // State
  const [wellnessPackages, setWellnessPackages] = useState<WellnessPackage[]>([
    {
      id: 'WP-001',
      name: 'Complete Wellness Pro',
      description: 'Comprehensive health package covering all aspects of wellness',
      type: 'premium',
      category: 'comprehensive',
      duration: 12,
      price: 2999,
      discountedPrice: 2499,
      discountPercentage: 17,
      features: [
        'Unlimited doctor consultations',
        'Annual health checkup',
        'Personal fitness trainer',
        'Nutritionist sessions',
        'Mental wellness coaching',
        '24/7 telemedicine support'
      ],
      inclusions: [
        'Complete blood work',
        'ECG & echocardiogram',
        'Body composition analysis',
        'Stress management sessions',
        'Yoga and meditation classes'
      ],
      targetAudience: ['Executives', 'High-income professionals', 'Health enthusiasts'],
      status: 'active',
      popularity: 5,
      recommendedFor: ['Busy professionals', 'Chronic disease management', 'Preventive care'],
      maxMembers: 1,
      registrationDate: '2024-01-01',
      validityPeriod: {
        start: '2024-01-01',
        end: '2024-12-31'
      },
      createdAt: '2023-11-15T10:00:00Z',
      updatedAt: '2024-10-20T14:30:00Z',
      salesCount: 245,
      rating: 4.8,
      totalConsultations: 50,
      labTestsIncluded: 25,
      fitnessSessions: 48,
      dietarySessions: 12,
      specialistVisits: 10
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '',
    duration: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<WellnessPackage | null>(null);

  // Apply filters and search
  const filteredPackages = wellnessPackages
    .filter(pkg => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          pkg.name.toLowerCase().includes(searchLower) ||
          pkg.description.toLowerCase().includes(searchLower) ||
          pkg.id.toLowerCase().includes(searchLower) ||
          pkg.targetAudience.some(audience => audience.toLowerCase().includes(searchLower)) ||
          pkg.recommendedFor.some(recommendation => recommendation.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      
      // Type filter
      if (filters.type && pkg.type !== filters.type) return false;
      
      // Category filter
      if (filters.category && pkg.category !== filters.category) return false;
      
      // Status filter
      if (filters.status && pkg.status !== filters.status) return false;
      
      // Duration filter
      if (filters.duration) {
        if (filters.duration === 'short' && pkg.duration > 3) return false;
        if (filters.duration === 'medium' && (pkg.duration <= 3 || pkg.duration > 6)) return false;
        if (filters.duration === 'long' && pkg.duration <= 6) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      const { key, direction } = sortConfig;
      let aValue: any = a[key as keyof WellnessPackage];
      let bValue: any = b[key as keyof WellnessPackage];
      
      // Handle date sorting
      if (key === 'createdAt' || key === 'updatedAt' || key === 'registrationDate') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }
      
      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPackages = filteredPackages.slice(startIndex, endIndex);

  // Handle sort
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Open Package Details Modal
  const handleViewPackageDetails = (pkg: WellnessPackage) => {
    setSelectedPackage(pkg);
    setShowPackageModal(true);
  };

  // Handle Purchase
  const handlePurchasePackage = (pkg: WellnessPackage) => {
    setSelectedPackage(pkg);
    setShowPurchaseModal(true);
  };

  // Handle delete package
  const handleDeletePackage = (pkg: WellnessPackage) => {
    setSelectedPackage(pkg);
    setShowDeleteModal(true);
  };

  // Confirm delete package
  const handleConfirmDelete = () => {
    if (selectedPackage) {
      setWellnessPackages(wellnessPackages.filter(p => p.id !== selectedPackage.id));
      setShowDeleteModal(false);
      setSelectedPackage(null);
      alert('Package deleted successfully!');
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get category icon
  const getCategoryIcon = (category: PackageCategory) => {
    switch (category) {
      case 'fitness': return <Dumbbell className="w-4 h-4" />;
      case 'nutrition': return <Apple className="w-4 h-4" />;
      case 'mental_health': return <Brain className="w-4 h-4" />;
      case 'preventive': return <Shield className="w-4 h-4" />;
      case 'comprehensive': return <Target className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  // Get category name
  const getCategoryName = (category: PackageCategory) => {
    switch (category) {
      case 'fitness': return 'Fitness';
      case 'nutrition': return 'Nutrition';
      case 'mental_health': return 'Mental Health';
      case 'preventive': return 'Preventive';
      case 'comprehensive': return 'Comprehensive';
      default: return category;
    }
  };

  // Get type badge
  const getTypeBadge = (type: PackageType) => {
    const config = {
      basic: { color: 'bg-blue-100 text-blue-800', label: 'Basic' },
      premium: { color: 'bg-purple-100 text-purple-800', label: 'Premium' },
      corporate: { color: 'bg-amber-100 text-amber-800', label: 'Corporate' },
      family: { color: 'bg-pink-100 text-pink-800', label: 'Family' },
      senior: { color: 'bg-indigo-100 text-indigo-800', label: 'Senior' }
    };
    
    const { color, label } = config[type];
    return <span className={`px-2 py-1 rounded-md text-xs font-medium ${color}`}>{label}</span>;
  };

  // Status Badge component
  const StatusBadge = ({ status }: { status: PackageStatus }) => {
    const config = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-red-100 text-red-800', icon: XCircle },
      upcoming: { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };

    const { color, icon: Icon } = config[status];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Rating Stars component
  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Calculate statistics
  const totalPackages = wellnessPackages.length;
  const activePackages = wellnessPackages.filter(p => p.status === 'active').length;
  const totalSales = wellnessPackages.reduce((sum, p) => sum + p.salesCount, 0);
  const averageRating = wellnessPackages.reduce((sum, p) => sum + p.rating, 0) / wellnessPackages.length;

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Sidebar />
      
      {/* Main Content */}
      <main className="lg:ml-64 lg:pt-6 lg:px-6 transition-all duration-300 ease-in-out text-black">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                  <Package className="w-8 h-8 mr-3 text-[#0A8F7A]" />
                  Wellness Packages
                </h1>
                <p className="text-gray-600 mt-2">Browse and purchase comprehensive health and wellness packages</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Package
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total Packages</p>
                    <p className="text-lg font-bold text-gray-900">{totalPackages}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-100">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Active Packages</p>
                    <p className="text-lg font-bold text-gray-900">{activePackages}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-lg font-bold text-gray-900">{totalSales}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Avg Rating</p>
                    <p className="text-lg font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by package name, description, ID, or target audience..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <FilterIcon className="w-5 h-5 mr-2" />
                  Filters
                  {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </button>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ type: '', category: '', status: '', duration: '' });
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={filters.type}
                      onChange={(e) => {
                        setFilters({...filters, type: e.target.value});
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Types</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="corporate">Corporate</option>
                      <option value="family">Family</option>
                      <option value="senior">Senior</option>
                    </select>

                    <select
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={filters.category}
                      onChange={(e) => {
                        setFilters({...filters, category: e.target.value});
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Categories</option>
                      <option value="fitness">Fitness</option>
                      <option value="nutrition">Nutrition</option>
                      <option value="mental_health">Mental Health</option>
                      <option value="preventive">Preventive</option>
                      <option value="comprehensive">Comprehensive</option>
                    </select>

                    <select
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={filters.status}
                      onChange={(e) => {
                        setFilters({...filters, status: e.target.value});
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="upcoming">Upcoming</option>
                    </select>

                    <select
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent"
                      value={filters.duration}
                      onChange={(e) => {
                        setFilters({...filters, duration: e.target.value});
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Durations</option>
                      <option value="short">Short (1-3 months)</option>
                      <option value="medium">Medium (4-6 months)</option>
                      <option value="long">Long (7+ months)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Packages Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Package Details
                          {sortConfig?.key === 'name' && (
                            sortConfig.direction === 'asc' ? 
                            <ChevronUp className="w-4 h-4 ml-1" /> : 
                            <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center">
                          Price & Duration
                          {sortConfig?.key === 'price' && (
                            sortConfig.direction === 'asc' ? 
                            <ChevronUp className="w-4 h-4 ml-1" /> : 
                            <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category & Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Features & Inclusions
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('salesCount')}
                      >
                        <div className="flex items-center">
                          Performance
                          {sortConfig?.key === 'salesCount' && (
                            sortConfig.direction === 'asc' ? 
                            <ChevronUp className="w-4 h-4 ml-1" /> : 
                            <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentPackages.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
                          <p className="text-gray-600 mb-4">
                            {searchQuery || Object.values(filters).some(f => f) 
                              ? 'Try adjusting your search or filters' 
                              : 'No wellness packages available'}
                          </p>
                          <button className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200">
                            <Plus className="w-5 h-5 mr-2" />
                            Create First Package
                          </button>
                        </td>
                      </tr>
                    ) : (
                      currentPackages.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                          {/* Package Details Column */}
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center">
                                <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                                  <Package className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-bold text-gray-900">{pkg.name}</div>
                                  <div className="text-xs text-gray-500">ID: {pkg.id}</div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{pkg.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                  <Users className="w-3 h-3 inline mr-1" />
                                  Max: {pkg.maxMembers || 1}
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {pkg.duration} months
                                </span>
                              </div>
                            </div>
                          </td>
                          
                          {/* Price & Duration Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              {pkg.discountedPrice ? (
                                <>
                                  <div className="flex items-center">
                                    <span className="text-lg font-bold text-gray-900">
                                      ${pkg.discountedPrice.toLocaleString()}
                                    </span>
                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      {pkg.discountPercentage}% OFF
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-500 line-through">
                                    ${pkg.price.toLocaleString()}
                                  </div>
                                </>
                              ) : (
                                <div className="text-lg font-bold text-gray-900">
                                  ${pkg.price.toLocaleString()}
                                </div>
                              )}
                              <div className="text-sm text-gray-600 mt-2">
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                  Valid: {formatDate(pkg.validityPeriod.start)} - {formatDate(pkg.validityPeriod.end)}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Category & Type Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                {getCategoryIcon(pkg.category)}
                                <span className="ml-2 text-sm text-gray-900">{getCategoryName(pkg.category)}</span>
                              </div>
                              {getTypeBadge(pkg.type)}
                              <div className="text-xs text-gray-500">
                                For: {pkg.targetAudience.join(', ')}
                              </div>
                            </div>
                          </td>
                          
                          {/* Features & Inclusions Column */}
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm text-gray-900 font-medium mb-1">Key Features:</div>
                              <ul className="text-xs text-gray-600 space-y-1 max-h-20 overflow-y-auto">
                                {pkg.features.slice(0, 3).map((feature, index) => (
                                  <li key={index} className="flex items-start">
                                    <CheckCircle className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                                    <span className="truncate">{feature}</span>
                                  </li>
                                ))}
                                {pkg.features.length > 3 && (
                                  <li className="text-blue-600 text-xs">+{pkg.features.length - 3} more features</li>
                                )}
                              </ul>
                              <div className="mt-2 text-xs text-gray-500">
                                Includes: {pkg.labTestsIncluded} tests, {pkg.specialistVisits} specialist visits
                              </div>
                            </div>
                          </td>
                          
                          {/* Performance Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">Sales:</span>
                                <span className="text-sm text-gray-900">{pkg.salesCount}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">Rating:</span>
                                <RatingStars rating={pkg.rating} />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">Popularity:</span>
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-3 h-3 ${star <= pkg.popularity ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Status Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <StatusBadge status={pkg.status} />
                              <div className="text-xs text-gray-500">
                                Updated: {formatDate(pkg.updatedAt)}
                              </div>
                            </div>
                          </td>
                          
                          {/* Actions Column */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => handleViewPackageDetails(pkg)}
                                className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                View
                              </button>
                              {/* {pkg.status === 'active' && (
                                <button
                                  onClick={() => handlePurchasePackage(pkg)}
                                  className="inline-flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white hover:shadow-md rounded-lg transition-all duration-200"
                                  title="Purchase Package"
                                >
                                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                                  Purchase
                                </button>
                              )} */}
                              <button
                                onClick={() => handleDeletePackage(pkg)}
                                className="inline-flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete Package"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer - Pagination */}
              {filteredPackages.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredPackages.length)}</span> of{' '}
                    <span className="font-medium">{filteredPackages.length}</span> packages
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-[#0A8F7A] text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Package Details Modal */}
      {showPackageModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPackage.name}</h2>
                  <p className="text-gray-600">Complete package details and specifications</p>
                </div>
                <button
                  onClick={() => setShowPackageModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Package Header */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-start">
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                      <Package className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="ml-6">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedPackage.name}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-lg font-bold text-gray-900">
                          {selectedPackage.discountedPrice ? (
                            <>
                              ${selectedPackage.discountedPrice.toLocaleString()}
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                ${selectedPackage.price.toLocaleString()}
                              </span>
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                {selectedPackage.discountPercentage}% OFF
                              </span>
                            </>
                          ) : (
                            `$${selectedPackage.price.toLocaleString()}`
                          )}
                        </span>
                        <StatusBadge status={selectedPackage.status} />
                        <span className="text-gray-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {selectedPackage.duration} months
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <button
                      onClick={() => handlePurchasePackage(selectedPackage)}
                      className="px-6 py-3 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                      disabled={selectedPackage.status !== 'active'}
                    >
                      Purchase Package
                    </button>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Package Information */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Package Description
                    </h4>
                    <p className="text-gray-700">{selectedPackage.description}</p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                        Key Features
                      </h4>
                      <ul className="space-y-2">
                        {selectedPackage.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Gift className="w-5 h-5 mr-2 text-purple-600" />
                        Package Inclusions
                      </h4>
                      <ul className="space-y-2">
                        {selectedPackage.inclusions.map((inclusion, index) => (
                          <li key={index} className="flex items-start">
                            <Award className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{inclusion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Sidebar Information */}
                <div className="space-y-6">
                  {/* Package Info Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Package Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Package ID:</span>
                        <span className="font-medium text-gray-900">{selectedPackage.id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Category:</span>
                        <div className="flex items-center">
                          {getCategoryIcon(selectedPackage.category)}
                          <span className="ml-2 font-medium text-gray-900">{getCategoryName(selectedPackage.category)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Type:</span>
                        {getTypeBadge(selectedPackage.type)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Max Members:</span>
                        <span className="font-medium text-gray-900">{selectedPackage.maxMembers || 1}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Validity:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(selectedPackage.validityPeriod.start)} - {formatDate(selectedPackage.validityPeriod.end)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Target Audience</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPackage.targetAudience.map((audience, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {audience}
                        </span>
                      ))}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-3">Recommended For</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPackage.recommendedFor.map((recommendation, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {recommendation}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Statistics */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-amber-600" />
                  Package Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedPackage.salesCount}</div>
                    <div className="text-sm text-gray-600">Total Sales</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      <RatingStars rating={selectedPackage.rating} />
                    </div>
                    <div className="text-sm text-gray-600">Customer Rating</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedPackage.popularity}/5</div>
                    <div className="text-sm text-gray-600">Popularity</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedPackage.totalConsultations}</div>
                    <div className="text-sm text-gray-600">Total Consultations</div>
                  </div>
                </div>
              </div>

              {/* Service Breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Service Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{selectedPackage.labTestsIncluded}</div>
                    <div className="text-sm text-gray-600">Lab Tests</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Dumbbell className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{selectedPackage.fitnessSessions}</div>
                    <div className="text-sm text-gray-600">Fitness Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <Apple className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{selectedPackage.dietarySessions}</div>
                    <div className="text-sm text-gray-600">Dietary Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{selectedPackage.specialistVisits}</div>
                    <div className="text-sm text-gray-600">Specialist Visits</div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPackageModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePurchasePackage(selectedPackage)}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                  disabled={selectedPackage.status !== 'active'}
                >
                  Purchase Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full">
                  <DollarSign className="w-12 h-12 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Confirm Package Purchase</h2>
              <p className="text-gray-600 text-center mb-6">
                You are about to purchase the following wellness package
              </p>

              {/* Package Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedPackage.name}</h3>
                    <p className="text-gray-600 text-sm">{selectedPackage.description}</p>
                  </div>
                  <div className="text-right">
                    {selectedPackage.discountedPrice ? (
                      <>
                        <div className="text-2xl font-bold text-gray-900">
                          ${selectedPackage.discountedPrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ${selectedPackage.price.toLocaleString()}
                        </div>
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-gray-900">
                        ${selectedPackage.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium ml-2">{selectedPackage.duration} months</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Members:</span>
                    <span className="font-medium ml-2">{selectedPackage.maxMembers || 1}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium ml-2">{getCategoryName(selectedPackage.category)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Validity:</span>
                    <span className="font-medium ml-2">
                      {formatDate(selectedPackage.validityPeriod.start)} - {formatDate(selectedPackage.validityPeriod.end)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Package Price</span>
                    <span className="font-medium">${selectedPackage.discountedPrice || selectedPackage.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-medium">
                      ${((selectedPackage.discountedPrice || selectedPackage.price) * 0.08).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="font-bold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-gray-900">
                      ${((selectedPackage.discountedPrice || selectedPackage.price) * 1.08).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Select Payment Method</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
                    <div className="font-medium text-gray-900">Credit Card</div>
                  </button>
                  <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
                    <div className="font-medium text-gray-900">Debit Card</div>
                  </button>
                  <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
                    <div className="font-medium text-gray-900">Net Banking</div>
                  </button>
                  <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
                    <div className="font-medium text-gray-900">UPI</div>
                  </button>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Package purchased successfully!');
                    setShowPurchaseModal(false);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Package</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this wellness package? This action cannot be undone.
              </p>

              <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
                <div className="text-center">
                  <p className="font-medium text-red-800 mb-1">{selectedPackage.name}</p>
                  <p className="text-sm text-red-700">ID: {selectedPackage.id}</p>
                  <p className="text-sm text-red-600 mt-1">
                    {getCategoryName(selectedPackage.category)} • {selectedPackage.duration} months
                  </p>
                  <p className="text-sm text-red-500 mt-1">
                    ${selectedPackage.price} • {selectedPackage.salesCount} sales
                  </p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}