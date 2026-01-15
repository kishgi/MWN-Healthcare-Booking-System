// components/WellnessPackageCard.tsx
import React from 'react';
import { 
  FaAppleAlt, 
  FaDumbbell, 
  FaLeaf, 
  FaBrain,
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaPercentage
} from 'react-icons/fa';

// Types
type PackageType = 'Nutrition' | 'Fitness' | 'Detox' | 'Stress Management';
type PaymentStatus = 'Paid' | 'Pending';

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
}

interface WellnessPackageCardProps {
  package: WellnessPackage;
}

const WellnessPackageCard: React.FC<WellnessPackageCardProps> = ({ package: pkg }) => {
  // Calculate derived values
  const remainingSessions = pkg.totalSessions - pkg.usedSessions;
  const usagePercentage = (pkg.usedSessions / pkg.totalSessions) * 100;
  const discountAmount = (pkg.packagePrice * pkg.discount) / 100;
  const subtotal = pkg.packagePrice - discountAmount;
  const taxAmount = (subtotal * pkg.taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  // Get icon based on package type
  const getPackageIcon = (type: PackageType) => {
    switch(type) {
      case 'Nutrition':
        return <FaAppleAlt className="w-5 h-5" />;
      case 'Fitness':
        return <FaDumbbell className="w-5 h-5" />;
      case 'Detox':
        return <FaLeaf className="w-5 h-5" />;
      case 'Stress Management':
        return <FaBrain className="w-5 h-5" />;
      default:
        return <FaAppleAlt className="w-5 h-5" />;
    }
  };

  // Get color classes based on package type
  const getPackageColor = (type: PackageType) => {
    switch(type) {
      case 'Nutrition':
        return { bg: 'bg-green-500', text: 'text-green-500', lightBg: 'bg-green-50', border: 'border-green-200' };
      case 'Fitness':
        return { bg: 'bg-blue-500', text: 'text-blue-500', lightBg: 'bg-blue-50', border: 'border-blue-200' };
      case 'Detox':
        return { bg: 'bg-emerald-500', text: 'text-emerald-500', lightBg: 'bg-emerald-50', border: 'border-emerald-200' };
      case 'Stress Management':
        return { bg: 'bg-purple-500', text: 'text-purple-500', lightBg: 'bg-purple-50', border: 'border-purple-200' };
      default:
        return { bg: 'bg-gray-500', text: 'text-gray-500', lightBg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const packageColor = getPackageColor(pkg.packageType);

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className={`${packageColor.bg} p-6 text-white`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {getPackageIcon(pkg.packageType)}
            </div>
            <div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                {pkg.packageType}
              </span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${pkg.paymentStatus === 'Paid' ? 'bg-green-400' : 'bg-amber-400'}`}>
            {pkg.paymentStatus}
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-4">{pkg.packageName}</h2>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Expiry Date */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <FaCalendarAlt className="w-4 h-4" />
            <span className="text-sm font-medium">Expiry Date</span>
          </div>
          <p className="text-lg font-semibold text-gray-800">{pkg.expiryDate}</p>
        </div>

        {/* Session Usage Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FaChartLine className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-700">Session Usage Tracker</h3>
            </div>
            <span className="text-sm font-medium text-gray-500">{usagePercentage.toFixed(0)}% Used</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className={`h-2.5 rounded-full ${packageColor.bg}`}
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-800">{pkg.totalSessions}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Used Sessions</p>
              <p className="text-2xl font-bold text-blue-600">{pkg.usedSessions}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-green-600">{remainingSessions}</p>
            </div>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="border-t pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaCreditCard className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-700">Billing Summary</h3>
          </div>

          <div className="space-y-3">
            {/* Package Price */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Package price</span>
              <span className="font-medium">${pkg.packagePrice.toFixed(2)}</span>
            </div>

            {/* Discount Applied */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FaPercentage className="w-3 h-3 text-green-500" />
                <span className="text-gray-600">Discount applied</span>
              </div>
              <span className="text-green-600 font-medium">-${discountAmount.toFixed(2)}</span>
            </div>

            {/* Subtotal */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>

            {/* Tax */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tax ({pkg.taxRate}%)</span>
              <span className="text-gray-600">${taxAmount.toFixed(2)}</span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="text-xl font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaCheckCircle className={`w-4 h-4 ${pkg.paymentStatus === 'Paid' ? 'text-green-500' : 'text-amber-500'}`} />
            <span className="text-sm text-gray-600">
              Payment Status: <span className="font-medium">{pkg.paymentStatus}</span>
            </span>
          </div>
          <button className={`px-4 py-2 rounded-lg font-medium text-white ${packageColor.bg} hover:opacity-90 transition-opacity`}>
            Book Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default WellnessPackageCard;