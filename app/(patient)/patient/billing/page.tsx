"use client"
// pages/BillingPage.tsx
import React, { useState } from 'react';
import Sidebar from '../../../components/PatientSidebar';
import { 
  FaDownload, 
  FaEye, 
  FaCheckCircle, 
  FaClock, 
  FaBars,
  FaBell,
  FaUserCircle,
  FaTrash,
  FaFilePdf
} from 'react-icons/fa';

// Types for payment transactions
interface PaymentTransaction {
  id: string;
  date: string;
  invoiceId: string;
  packageName: string;
  amount: number;
  status: 'Paid' | 'Pending';
  serviceType: string;
}

// Dummy payment data - Patient only sees their own payments
const dummyPayments: PaymentTransaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    invoiceId: 'INV-2024-001',
    packageName: 'Premium Wellness Plan',
    amount: 299.99,
    status: 'Paid',
    serviceType: 'Monthly Subscription'
  },
  {
    id: '2',
    date: '2024-01-10',
    invoiceId: 'INV-2024-002',
    packageName: 'Yoga Sessions Bundle',
    amount: 150.00,
    status: 'Pending',
    serviceType: 'Package Purchase'
  },
  {
    id: '3',
    date: '2024-01-05',
    invoiceId: 'INV-2024-003',
    packageName: 'Nutrition Consultation',
    amount: 89.99,
    status: 'Paid',
    serviceType: 'Single Session'
  },
  {
    id: '4',
    date: '2024-01-01',
    invoiceId: 'INV-2024-004',
    packageName: 'Detox Program',
    amount: 249.50,
    status: 'Paid',
    serviceType: 'Package Purchase'
  },
  {
    id: '5',
    date: '2023-12-28',
    invoiceId: 'INV-2023-125',
    packageName: 'Stress Management',
    amount: 175.00,
    status: 'Paid',
    serviceType: 'Monthly Subscription'
  }
];

const BillingPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentTransaction[]>(dummyPayments);

  const handleViewInvoice = (invoiceId: string) => {
    // In a real app, this would open a modal or navigate to invoice details
    alert(`Viewing invoice: ${invoiceId}`);
  };

  const handleDeletePayment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      setPayments(payments.filter(payment => payment.id !== id));
    }
  };

  const handleDownloadAll = () => {
    alert('Downloading all invoices as PDF...');
  };

  const handleDownloadPDF = (invoiceId: string) => {
    alert(`Downloading PDF for invoice: ${invoiceId}`);
  };

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidPayments = payments.filter(p => p.status === 'Paid').length;
  const pendingPayments = payments.filter(p => p.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 w-64 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 overflow-x-hidden ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        

        {/* Main Content Area */}
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="md:hidden mb-4">
                <p className="text-gray-600">Manage your payment history</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Payment History</h2>
                  <p className="text-gray-600 mt-1">Track and manage all your transactions</p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleDownloadAll}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FaDownload className="w-4 h-4 mr-2" />
                    Download All PDFs
                  </button>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Make New Payment
                  </button>
                </div>
              </div>
            </div>

            {/* Billing Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-800">${totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">$</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Paid Payments</p>
                    <p className="text-2xl font-bold text-green-600">{paidPayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <FaCheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
                    <p className="text-2xl font-bold text-amber-600">{pendingPayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                    <FaClock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">My Payments</h2>
                    <p className="text-sm text-gray-600 mt-1">Showing {payments.length} transactions</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                      Export CSV
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                      View All
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Package / Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{payment.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">{payment.invoiceId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{payment.packageName}</div>
                            <div className="text-sm text-gray-500">{payment.serviceType}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            ${payment.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {payment.status === 'Paid' ? (
                              <FaCheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <FaClock className="w-3 h-3 mr-1" />
                            )}
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewInvoice(payment.invoiceId)}
                              className="inline-flex items-center px-3 py-1.5 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              <FaEye className="w-3 h-3 mr-1.5" />
                              View
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(payment.invoiceId)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <FaFilePdf className="w-3 h-3 mr-1.5" />
                              PDF
                            </button>
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-red-500 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <FaTrash className="w-3 h-3 mr-1.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Showing <span className="font-medium">{payments.length}</span> transactions • Total: <span className="font-bold">${totalAmount.toFixed(2)}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      ← Previous
                    </button>
                    <span className="text-sm text-gray-500">Page 1 of 1</span>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;