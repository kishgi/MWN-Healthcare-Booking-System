"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../../components/PatientSidebar";
import {
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaBars,
  FaBell,
  FaUserCircle,
  FaTrash,
  FaFilePdf,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaPrint,
  FaShare,
  FaCalendarAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import { db } from "@/app/firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

// Types for payment transactions
interface PaymentTransaction {
  id: string;
  date: string;
  invoiceId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  services: Array<{
    name: string;
    amount: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "Paid" | "Pending" | "Partial";
  paymentMethod: string;
  paidAt?: string;
  createdBy: string;
  createdAt: string;
  amountPaid?: number;
  balanceDue?: number;
  packageName?: string;
  serviceType?: string;
}

export default function BillingPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Patient ID (using PAT-001 from your seed data)
  const patientId = "PAT-001";
  const patientName = "Robert Chen";

  // Fetch payments from Firestore
  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);

      // Query bills for this specific patient
      const billsQuery = query(
        collection(db, "billing"),
        where("patientId", "==", patientId),
        orderBy("createdAt", "desc"),
      );

      const billsSnapshot = await getDocs(billsQuery);
      const billsData = billsSnapshot.docs.map((doc) => {
        const data = doc.data();

        // Create a package/service name from services
        const packageName =
          data.services && data.services.length > 0
            ? data.services[0].name
            : "Medical Services";

        // Determine service type
        const serviceType =
          data.services && data.services.length > 1
            ? "Multiple Services"
            : data.services?.[0]?.name || "Consultation";

        return {
          id: doc.id,
          date: data.createdAt || new Date().toISOString(),
          invoiceId: `INV-${doc.id.slice(-6).toUpperCase()}`,
          appointmentId: data.appointmentId || "",
          patientId: data.patientId,
          patientName: data.patientName,
          services: data.services || [],
          subtotal: data.subtotal || 0,
          discount: data.discount || 0,
          tax: data.tax || 0,
          total: data.total || 0,
          status: data.status || "Pending",
          paymentMethod: data.paymentMethod || "Not specified",
          paidAt: data.paidAt,
          createdBy: data.createdBy || "System",
          createdAt: data.createdAt || new Date().toISOString(),
          amountPaid: data.amountPaid,
          balanceDue: data.balanceDue,
          packageName: packageName,
          serviceType: serviceType,
        };
      }) as PaymentTransaction[];

      setPayments(billsData);
    } catch (error) {
      console.error("Error fetching billing data:", error);

      // Fallback data with LKR prices
      const fallbackPayments: PaymentTransaction[] = [
        {
          id: "BILL-001",
          date: "2024-12-01",
          invoiceId: "INV-2024-001",
          appointmentId: "APP-001",
          patientId: "PAT-001",
          patientName: "Robert Chen",
          services: [
            { name: "Consultation", amount: 5000 },
            { name: "ECG Test", amount: 2500 },
            { name: "Blood Work", amount: 3000 },
          ],
          subtotal: 10500,
          discount: 1050,
          tax: 945,
          total: 10395,
          status: "Paid",
          paymentMethod: "credit_card",
          paidAt: "2024-12-01T10:30:00Z",
          createdBy: "STF-001",
          createdAt: "2024-12-01T09:00:00Z",
          packageName: "Cardiac Consultation",
          serviceType: "Multiple Services",
        },
        {
          id: "BILL-002",
          date: "2024-12-02",
          invoiceId: "INV-2024-002",
          appointmentId: "APP-002",
          patientId: "PAT-001",
          patientName: "Robert Chen",
          services: [
            { name: "Consultation", amount: 5000 },
            { name: "Spirometry", amount: 2000 },
          ],
          subtotal: 7000,
          discount: 700,
          tax: 630,
          total: 6930,
          status: "Pending",
          paymentMethod: "cash",
          createdBy: "STF-002",
          createdAt: "2024-12-02T14:30:00Z",
          packageName: "Asthma Checkup",
          serviceType: "Multiple Services",
        },
        {
          id: "BILL-003",
          date: "2024-12-03",
          invoiceId: "INV-2024-003",
          appointmentId: "APP-004",
          patientId: "PAT-001",
          patientName: "Robert Chen",
          services: [
            { name: "Consultation", amount: 5000 },
            { name: "MRI Scan", amount: 15000 },
          ],
          subtotal: 20000,
          discount: 2000,
          tax: 1800,
          total: 19800,
          status: "Partial",
          paymentMethod: "insurance",
          amountPaid: 10000,
          balanceDue: 9800,
          createdBy: "STF-001",
          createdAt: "2024-12-03T11:00:00Z",
          packageName: "MRI Scan",
          serviceType: "Scan Services",
        },
      ];

      setPayments(fallbackPayments);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format currency in Sri Lankan Rupees
  const formatLKR = (amount: number): string => {
    return `Rs. ${amount.toLocaleString("en-LK")}`;
  };

  // Filter and sort payments
  const filteredPayments = payments.filter((payment) => {
    // Search filter
    const matchesSearch =
      payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.patientName.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus =
      filterStatus === "All" || payment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Sort payments
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    const multiplier = sortOrder === "asc" ? 1 : -1;

    switch (sortBy) {
      case "amount":
        return (b.total - a.total) * multiplier;
      case "date":
      default:
        return (
          (new Date(b.date).getTime() - new Date(a.date).getTime()) * multiplier
        );
    }
  });

  const handleViewInvoice = (invoiceId: string) => {
    alert(
      `Viewing invoice: ${invoiceId}\nThis would open a detailed invoice modal in a real app.`,
    );
  };

  const handleDeletePayment = (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this payment record?")
    ) {
      setPayments(payments.filter((payment) => payment.id !== id));
      // In a real app, you would delete from Firestore here
    }
  };

  const handleDownloadAll = () => {
    alert("Downloading all invoices as PDF...");
  };

  const handleDownloadPDF = (invoiceId: string) => {
    alert(`Downloading PDF for invoice: ${invoiceId}`);
  };

  const handleMakePayment = (payment: PaymentTransaction) => {
    if (payment.status === "Pending" || payment.status === "Partial") {
      const amountDue =
        payment.status === "Partial" ? payment.balanceDue : payment.total;
      alert(
        `Initiating payment for ${payment.invoiceId}\nAmount due: ${formatLKR(amountDue || payment.total)}\nThis would open a payment gateway in a real app.`,
      );
    } else {
      alert("This invoice is already paid.");
    }
  };

  const handlePrintInvoice = (payment: PaymentTransaction) => {
    alert(`Printing invoice: ${payment.invoiceId}`);
  };

  const handleShareInvoice = (payment: PaymentTransaction) => {
    alert(
      `Sharing invoice: ${payment.invoiceId}\nThis would open sharing options in a real app.`,
    );
  };

  // Calculate totals
  const totalAmount = payments.reduce((sum, payment) => sum + payment.total, 0);
  const paidPayments = payments.filter((p) => p.status === "Paid").length;
  const pendingPayments = payments.filter((p) => p.status === "Pending").length;
  const partialPayments = payments.filter((p) => p.status === "Partial").length;

  // Calculate total due
  const totalDue = payments
    .filter((p) => p.status === "Pending" || p.status === "Partial")
    .reduce((sum, payment) => {
      if (payment.status === "Partial") {
        return sum + (payment.balanceDue || 0);
      }
      return sum + payment.total;
    }, 0);

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );

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
      <div
        className={`flex-1 overflow-x-hidden ${sidebarCollapsed ? "md:ml-20" : "md:ml-64"}`}
      >
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <FaBars className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Billing</h1>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <FaBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">RC</span>
              </div>
            </div>
          </div>
        </div>

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
                  <h2 className="text-2xl font-bold text-gray-900">
                    My Payment History
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Track and manage all your transactions in Sri Lankan Rupees
                    (LKR)
                  </p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatLKR(totalAmount)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FaMoneyBillWave className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Paid Payments</p>
                    <p className="text-2xl font-bold text-green-600">
                      {paidPayments}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <FaCheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Pending Payments
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                      {pendingPayments}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                    <FaClock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount Due</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatLKR(totalDue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold">Rs.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices, services, or amounts..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>

                  <select
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "date" | "amount")
                    }
                  >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                  </select>

                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {sortOrder === "asc" ? (
                      <FaSortAmountUp className="w-4 h-4" />
                    ) : (
                      <FaSortAmountDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        My Payments
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Showing {sortedPayments.length} of {payments.length}{" "}
                        transactions
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        Export CSV
                      </button>
                      <button
                        onClick={handleDownloadAll}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        Download All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Invoice ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Service Details
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount (LKR)
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedPayments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(payment.date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blue-600">
                              {payment.invoiceId}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {payment.packageName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.serviceType}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {payment.services
                                  ?.slice(0, 2)
                                  .map((service, index) => (
                                    <span key={index} className="mr-2">
                                      {service.name}
                                    </span>
                                  ))}
                                {payment.services &&
                                  payment.services.length > 2 && (
                                    <span>
                                      +{payment.services.length - 2} more
                                    </span>
                                  )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatLKR(payment.total)}
                            </div>
                            {payment.status === "Partial" &&
                              payment.balanceDue && (
                                <div className="text-xs text-red-600">
                                  Balance: {formatLKR(payment.balanceDue)}
                                </div>
                              )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "Partial"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {payment.status === "Paid" ? (
                                <FaCheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <FaClock className="w-3 h-3 mr-1" />
                              )}
                              {payment.status}
                            </span>
                            {payment.paymentMethod && (
                              <div className="text-xs text-gray-500 mt-1">
                                Via: {payment.paymentMethod.replace("_", " ")}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleViewInvoice(payment.invoiceId)
                                }
                                className="inline-flex items-center px-3 py-1.5 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                title="View Invoice"
                              >
                                <FaEye className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDownloadPDF(payment.invoiceId)
                                }
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                title="Download PDF"
                              >
                                <FaFilePdf className="w-3 h-3" />
                              </button>
                              {(payment.status === "Pending" ||
                                payment.status === "Partial") && (
                                <button
                                  onClick={() => handleMakePayment(payment)}
                                  className="inline-flex items-center px-3 py-1.5 border border-green-500 text-green-600 rounded-md hover:bg-green-50 transition-colors"
                                  title="Make Payment"
                                >
                                  Pay
                                </button>
                              )}
                              <button
                                onClick={() => handlePrintInvoice(payment)}
                                className="inline-flex items-center px-3 py-1.5 border border-purple-500 text-purple-600 rounded-md hover:bg-purple-50 transition-colors"
                                title="Print"
                              >
                                <FaPrint className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleShareInvoice(payment)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                title="Share"
                              >
                                <FaShare className="w-3 h-3" />
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
                        Showing{" "}
                        <span className="font-medium">
                          {sortedPayments.length}
                        </span>{" "}
                        transactions • Total Amount:{" "}
                        <span className="font-bold">
                          {formatLKR(totalAmount)}
                        </span>{" "}
                        • Amount Due:{" "}
                        <span className="font-bold text-red-600">
                          {formatLKR(totalDue)}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        Patient:{" "}
                        <span className="font-medium">{patientName}</span> • ID:{" "}
                        <span className="font-medium">{patientId}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Payment Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Paid Amount</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatLKR(
                          payments
                            .filter((p) => p.status === "Paid")
                            .reduce((sum, p) => sum + p.total, 0),
                        )}
                      </p>
                    </div>
                    <FaCheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Discounts Applied</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatLKR(
                          payments.reduce(
                            (sum, p) => sum + (p.discount || 0),
                            0,
                          ),
                        )}
                      </p>
                    </div>
                    <FaMoneyBillWave className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Average Invoice Amount
                      </p>
                      <p className="text-xl font-bold text-purple-600">
                        {payments.length > 0
                          ? formatLKR(Math.round(totalAmount / payments.length))
                          : "Rs. 0"}
                      </p>
                    </div>
                    <FaCalendarAlt className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
