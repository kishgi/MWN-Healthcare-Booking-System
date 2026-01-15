'use client';

import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  DollarSign,
  Star,
  Leaf,
  Activity,
  Shield,
  Brain,
  Heart
} from 'lucide-react';

interface SimpleWellnessProgramProps {
  program: {
    id: string;
    name: string;
    description: string;
    category: 'nutrition' | 'fitness' | 'detox' | 'stress' | 'wellness';
    duration: string;
    totalSessions: number;
    originalPrice: number;
    finalPrice: number;
    rating: number;
    features: string[];
    isPopular?: boolean;
  };
  onEnroll: (programId: string) => void;
  onViewDetails: (programId: string) => void;
}

const SimpleWellnessProgramCard = ({ program, onEnroll, onViewDetails }: SimpleWellnessProgramProps) => {
  const categoryIcons = {
    nutrition: Leaf,
    fitness: Activity,
    detox: Shield,
    stress: Brain,
    wellness: Heart
  };

  const categoryColors = {
    nutrition: 'bg-emerald-500',
    fitness: 'bg-blue-500',
    detox: 'bg-purple-500',
    stress: 'bg-amber-500',
    wellness: 'bg-[#0A8F7A]'
  };

  const CategoryIcon = categoryIcons[program.category];
  const categoryColor = categoryColors[program.category];

  const discount = ((program.originalPrice - program.finalPrice) / program.originalPrice * 100).toFixed(0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Popular Badge */}
      {program.isPopular && (
        <div className="absolute top-3 right-3 z-10">
          <div className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
            POPULAR
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className={`${categoryColor} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg">
              <CategoryIcon className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-sm font-medium text-white bg-white/20 px-2 py-1 rounded">
              {program.category.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center text-white">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-bold">{program.rating}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{program.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{program.description}</p>

        {/* Program Details */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>{program.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{program.totalSessions} sessions</span>
          </div>
        </div>

        {/* Features List */}
        <div className="mb-4">
          {program.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-gray-700 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
              <span>{feature}</span>
            </div>
          ))}
          {program.features.length > 3 && (
            <div className="text-sm text-gray-500 pl-6">+{program.features.length - 3} more features</div>
          )}
        </div>

        {/* Pricing Section */}
        <div className="mt-auto">
          <div className="flex items-baseline mb-3">
            {discount !== '0' && (
              <span className="text-sm text-gray-500 line-through mr-2">
                ${program.originalPrice}
              </span>
            )}
            <span className="text-2xl font-bold text-gray-900">
              ${program.finalPrice}
            </span>
            {discount !== '0' && (
              <span className="ml-2 text-sm font-bold text-green-600">
                Save {discount}%
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEnroll(program.id)}
              className={`px-3 py-2 ${categoryColor} text-white font-medium rounded-lg hover:opacity-90 transition-opacity text-sm`}
            >
              Enroll Now
            </button>
            <button
              onClick={() => onViewDetails(program.id)}
              className="px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example usage with simpler data
export const SimpleWellnessProgramsDemo = () => {
  const samplePrograms = [
    {
      id: 'wp-001',
      name: 'Nutrition Program',
      description: 'Personalized nutrition and diet guidance.',
      category: 'nutrition' as const,
      duration: '3 months',
      totalSessions: 12,
      originalPrice: 600,
      finalPrice: 540,
      rating: 4.8,
      features: ['Meal Plans', 'Weekly Tracking', 'Expert Support'],
      isPopular: true
    },
    {
      id: 'wp-002',
      name: 'Fitness Training',
      description: 'Complete fitness transformation program.',
      category: 'fitness' as const,
      duration: '4 months',
      totalSessions: 20,
      originalPrice: 800,
      finalPrice: 720,
      rating: 4.9,
      features: ['Custom Workouts', 'Progress Tracking', 'Video Guides']
    },
    {
      id: 'wp-003',
      name: 'Detox Program',
      description: 'Gentle detoxification and cleansing.',
      category: 'detox' as const,
      duration: '1 month',
      totalSessions: 6,
      originalPrice: 300,
      finalPrice: 270,
      rating: 4.6,
      features: ['Detox Protocol', 'Supplement Guide', 'Daily Support']
    },
    {
      id: 'wp-004',
      name: 'Stress Management',
      description: 'Mindfulness and stress reduction techniques.',
      category: 'stress' as const,
      duration: '3 months',
      totalSessions: 12,
      originalPrice: 500,
      finalPrice: 450,
      rating: 4.7,
      features: ['Therapy Sessions', 'Meditation', 'Sleep Support']
    },
    {
      id: 'wp-005',
      name: 'Wellness Package',
      description: 'Complete health and wellness program.',
      category: 'wellness' as const,
      duration: '6 months',
      totalSessions: 24,
      originalPrice: 1200,
      finalPrice: 1080,
      rating: 4.9,
      features: ['Comprehensive Plan', 'All Access', 'Priority Support'],
      isPopular: true
    },
    {
      id: 'wp-006',
      name: 'Yoga & Meditation',
      description: 'Yoga sessions and meditation practices.',
      category: 'wellness' as const,
      duration: '2 months',
      totalSessions: 16,
      originalPrice: 400,
      finalPrice: 360,
      rating: 4.8,
      features: ['Yoga Classes', 'Meditation', 'Breathing Exercises']
    }
  ];

  const handleEnroll = (programId: string) => {
    alert(`Enrolling in program: ${programId}`);
  };

  const handleViewDetails = (programId: string) => {
    alert(`Viewing details for program: ${programId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Wellness Programs</h1>
          <p className="text-gray-600">Simple, effective health programs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {samplePrograms.map((program) => (
            <SimpleWellnessProgramCard
              key={program.id}
              program={program}
              onEnroll={handleEnroll}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleWellnessProgramCard;