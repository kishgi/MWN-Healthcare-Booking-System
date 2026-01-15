'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  TrendingUp,
  Heart,
  Leaf,
  Activity,
  Brain,
  Shield,
  Star,
  Users,
  Clock,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Sparkles,
  Award,
  Target,
  Calendar,
  DollarSign,
  MapPin
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import WellnessProgramCard from '../../components/WellnessProgramCard';

// Define types
type ProgramCategory = 'all' | 'nutrition' | 'fitness' | 'detox' | 'stress' | 'wellness';
type MembershipType = 'none' | 'silver' | 'gold' | 'platinum';
type SortOption = 'popular' | 'rating' | 'price-low' | 'price-high' | 'newest';

export default function WellnessProgramsPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProgramCategory>('all');
  const [selectedMembership, setSelectedMembership] = useState<MembershipType>('gold');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>('all');

  // Define calculatePrice function BEFORE it's used
  const calculatePrice = (program: any, membership: MembershipType) => {
    const discount = membership === 'none' ? 0 : program.membershipDiscount[membership];
    const priceAfterDiscount = program.originalPrice * (1 - discount / 100);
    const taxAmount = priceAfterDiscount * (program.wellnessTax / 100);
    return {
      discount,
      priceAfterDiscount,
      taxAmount,
      finalPrice: priceAfterDiscount + taxAmount
    };
  };

  // Sample programs data (in real app, fetch from API)
  const programs = [
    {
      id: 'wp-001',
      name: 'Nutrition & Diet Program',
      description: 'A personalized nutrition and diet guidance program to improve your overall health through expert consultations and tailored meal plans.',
      category: 'nutrition' as const,
      sessions: [
        { type: 'Dietitian Sessions', count: 10, icon: Users, color: 'bg-emerald-500' },
        { type: 'Nutrition Coach', count: 5, icon: Users, color: 'bg-green-500' },
        { type: 'Wellness Doctor', count: 2, icon: Users, color: 'bg-teal-500' },
        { type: 'Progress Reviews', count: 4, icon: Calendar, color: 'bg-blue-500' }
      ],
      duration: '3 months',
      validity: '6 months after enrollment',
      pricePerSession: 50,
      totalSessions: 21,
      originalPrice: 1050,
      membershipDiscount: {
        silver: 10,
        gold: 20,
        platinum: 30
      },
      wellnessTax: 8,
      features: ['Personalized Meal Plans', 'Weekly Progress Tracking', '24/7 Support', 'Mobile App Access', 'Recipe Library'],
      rating: 4.8,
      enrolledCount: 1245,
      isPopular: true,
      location: 'All branches',
      difficulty: 'Beginner',
      doctor: 'Dr. Sarah Johnson'
    },
  
  ];

  // Categories
  const categories = [
    { id: 'all', label: 'All Programs', icon: Sparkles, count: 56 },
    { id: 'nutrition', label: 'Nutrition', icon: Leaf, count: 12 },
    { id: 'fitness', label: 'Fitness', icon: Activity, count: 18 },
    { id: 'detox', label: 'Detox', icon: Shield, count: 8 },
    { id: 'stress', label: 'Stress', icon: Brain, count: 10 },
    { id: 'wellness', label: 'Wellness', icon: Heart, count: 8 }
  ];

  // Durations
  const durations = [
    { value: 'all', label: 'All Durations' },
    { value: '1', label: '1 Month' },
    { value: '3', label: '3 Months' },
    { value: '6', label: '6 Months' },
    { value: '12', label: '12 Months' }
  ];

  // Difficulty levels
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  // Filter and sort programs
  const filteredPrograms = programs
    .filter(program => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || program.category === selectedCategory;
      
      // Price filter - using the calculatePrice function that's now defined above
      const priceDetails = calculatePrice(program, selectedMembership);
      const matchesPrice = priceDetails.finalPrice >= priceRange[0] && priceDetails.finalPrice <= priceRange[1];
      
      // Duration filter
      const durationMonths = parseInt(program.duration.split(' ')[0]);
      const matchesDuration = selectedDuration === 'all' || durationMonths === parseInt(selectedDuration);
      
      return matchesSearch && matchesCategory && matchesPrice && matchesDuration;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.enrolledCount - a.enrolledCount;
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return calculatePrice(a, selectedMembership).finalPrice - calculatePrice(b, selectedMembership).finalPrice;
        case 'price-high':
          return calculatePrice(b, selectedMembership).finalPrice - calculatePrice(a, selectedMembership).finalPrice;
        case 'newest':
          return b.enrolledCount - a.enrolledCount; // Simulate newest
        default:
          return 0;
      }
    });

  // Handle enroll
  const handleEnroll = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (program) {
      // In real app: redirect to enrollment page or show modal
      alert(`Starting enrollment for: ${program.name}\n\nYou will be redirected to the enrollment page.`);
    }
  };

  // Handle view details
  const handleViewDetails = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (program) {
      // In real app: redirect to program details page
      alert(`Viewing details for: ${program.name}\n\nThis would show the complete program details page.`);
    }
  };

  // Stats
  const stats = {
    totalPrograms: programs.length,
    averageRating: (programs.reduce((sum, p) => sum + p.rating, 0) / programs.length).toFixed(1),
    totalEnrolled: programs.reduce((sum, p) => sum + p.enrolledCount, 0),
    satisfactionRate: '96%'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50/30 text-black">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0]">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Wellness Programs
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Transform your health with our expert-led wellness programs. 
              Personalized plans designed for your unique journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search programs by name, description, or goal..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center justify-center"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 text-white">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor" opacity=".1"></path>
          </svg>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 mr-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalPrograms}</div>
                <div className="text-sm text-gray-600">Total Programs</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-100 to-green-100 mr-4">
                <Star className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
                <div className="text-sm text-gray-600">Avg. Rating</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 mr-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalEnrolled.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Enrolled</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 mr-4">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.satisfactionRate}</div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:flex gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Filters</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Membership Selection */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Your Membership</h4>
                <div className="space-y-2">
                  {(['none', 'silver', 'gold', 'platinum'] as MembershipType[]).map((membership) => (
                    <button
                      key={membership}
                      onClick={() => setSelectedMembership(membership)}
                      className={`w-full px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                        selectedMembership === membership
                          ? membership === 'none' ? 'bg-gray-100 text-gray-900' :
                            membership === 'silver' ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900' :
                            membership === 'gold' ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900' :
                            'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{membership === 'none' ? 'No Membership' : membership}</span>
                        {membership !== 'none' && (
                          <span className="text-sm font-bold">
                            {membership === 'silver' ? '10% off' :
                             membership === 'gold' ? '20% off' : '30% off'}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id as ProgramCategory)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-[#D6F4ED]/30 to-[#C0F0E5]/30 text-[#0A8F7A]'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-3" />
                          <span>{category.label}</span>
                        </div>
                        <span className="text-sm text-gray-500">{category.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Duration</h4>
                <div className="space-y-2">
                  {durations.map((duration) => (
                    <button
                      key={duration.value}
                      onClick={() => setSelectedDuration(duration.value)}
                      className={`w-full px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                        selectedDuration === duration.value
                          ? 'bg-gradient-to-r from-[#D6F4ED]/30 to-[#C0F0E5]/30 text-[#0A8F7A]'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDuration('all');
                  setPriceRange([0, 5000]);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Clear All Filters
              </button>
            </div>

            {/* Benefits Card */}
            <div className="bg-gradient-to-br from-[#0A8F7A] to-[#06D6A0] rounded-2xl p-6 text-white">
              <h3 className="font-bold text-xl mb-4">Why Choose Our Programs?</h3>
              <ul className="space-y-3">
                {[
                  'Expert-led by certified professionals',
                  'Personalized plans for your needs',
                  'Flexible online & in-person sessions',
                  'Progress tracking & support',
                  'Money-back satisfaction guarantee'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header with Sort */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {filteredPrograms.length} Program{filteredPrograms.length !== 1 ? 's' : ''} Found
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Showing programs for <span className="font-medium text-[#0A8F7A]">{selectedMembership.charAt(0).toUpperCase() + selectedMembership.slice(1)} Membership</span>
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A8F7A] focus:border-transparent bg-white"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center"
                  >
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Programs Grid */}
            {filteredPrograms.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No programs found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedDuration('all');
                    setPriceRange([0, 5000]);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPrograms.map((program) => (
                  <WellnessProgramCard
                    key={program.id}
                    program={program}
                    userMembership={selectedMembership}
                    onEnroll={handleEnroll}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-12 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-2xl border border-gray-200 p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Not Sure Which Program is Right for You?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Take our 2-minute wellness assessment to get personalized program recommendations based on your health goals and lifestyle.
              </p>
              <button className="px-8 py-3.5 bg-gradient-to-r from-[#0A8F7A] to-[#06D6A0] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#0A8F7A]/30 transition-all duration-200 inline-flex items-center">
                Take Free Assessment
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}