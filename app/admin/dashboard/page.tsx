"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName?: string;
  packageType: 'byod' | 'full';
  numberOfDomains: number;
  totalAccounts: number;
  amountTotal: number;
  currency: string;
  status: string;
  progressStatus: string;
  progressPercentage: number;
  paymentStatus?: string;
  customDomains?: string[];
  selectedDomains?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 orders per page
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editProgress, setEditProgress] = useState(0);
  const [editProgressStatus, setEditProgressStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDownloadCsv = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/export-csv?orderId=${encodeURIComponent(orderId)}`);

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-${orderId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('CSV download error:', err);
      alert(err.message || 'Failed to download CSV');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');

      if (response.status === 401) {
        // Redirect to login if unauthorized
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchOrders();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setEditStatus(order.status);
    setEditProgress(order.progressPercentage);
    setEditProgressStatus(order.progressStatus);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingOrder(null);
    setEditStatus("");
    setEditProgress(0);
    setEditProgressStatus("");
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/orders/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: editingOrder.orderId,
          status: editStatus,
          progressPercentage: editProgress,
          progressStatus: editProgressStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      // Refresh orders after update
      await fetchOrders();
      closeEditModal();
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'in-review': 'rgba(59, 130, 246, 0.2)',
      'processing': 'rgba(234, 179, 8, 0.2)',
      'completed': 'rgba(34, 197, 94, 0.2)',
      'failed': 'rgba(239, 68, 68, 0.2)',
      'cancelled': 'rgba(156, 163, 175, 0.2)',
      'on-hold': 'rgba(249, 115, 22, 0.2)',
    };
    return colors[status] || 'rgba(255, 255, 255, 0.1)';
  };

  const getStatusTextColor = (status: string) => {
    const colors: any = {
      'in-review': '#60a5fa',
      'processing': '#fbbf24',
      'completed': '#4ade80',
      'failed': '#f87171',
      'cancelled': '#9ca3af',
      'on-hold': '#fb923c',
    };
    return colors[status] || '#ffffff';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)" }}>
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: '#ff6e40' }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-300 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)" }}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(255, 110, 64, 0.25) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000" style={{ background: 'radial-gradient(circle, rgba(255, 110, 64, 0.2) 0%, transparent 70%)' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                Admin
              </span>{' '}
              Dashboard
            </h1>
            <p className="text-gray-400">Manage and track all customer orders</p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <span className="flex items-center gap-2">
                <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)',
              }}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div
            className="p-6 rounded-2xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-white">{orders.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255, 110, 64, 0.2)' }}>
                <svg className="w-6 h-6" style={{ color: '#ff6e40' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-2xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">In Review</p>
                <p className="text-3xl font-bold text-white">{orders.filter(o => o.status === 'in-review').length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                <svg className="w-6 h-6" style={{ color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-2xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Processing</p>
                <p className="text-3xl font-bold text-white">{orders.filter(o => o.status === 'processing').length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(234, 179, 8, 0.2)' }}>
                <svg className="w-6 h-6" style={{ color: '#fbbf24' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-2xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-white">{orders.filter(o => o.status === 'completed').length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                <svg className="w-6 h-6" style={{ color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div
          className="p-6 rounded-2xl border mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Search Orders</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, order ID..."
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  borderColor: 'rgba(75, 85, 99, 1)',
                  color: '#e5e7eb',
                }}
              >
                <option value="all" className="bg-[#020617] text-white">All Statuses</option>
                <option value="in-review" className="bg-[#020617] text-white">In Review</option>
                <option value="processing" className="bg-[#020617] text-white">Processing</option>
                <option value="completed" className="bg-[#020617] text-white">Completed</option>
                <option value="failed" className="bg-[#020617] text-white">Failed</option>
                <option value="cancelled" className="bg-[#020617] text-white">Cancelled</option>
                <option value="on-hold" className="bg-[#020617] text-white">On Hold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {error && (
          <div className="p-4 rounded-xl border mb-8" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: '#ff6e40' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-400 text-lg">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div
                  className="overflow-hidden rounded-2xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    maxHeight: '600px',
                    overflow: 'auto',
                  }}
                >
                  <table className="min-w-full divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <thead>
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sticky top-0 z-10" style={{ background: 'rgba(26, 26, 26, 0.95)' }}>Order Details</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sticky top-0 z-10" style={{ background: 'rgba(26, 26, 26, 0.95)' }}>Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sticky top-0 z-10" style={{ background: 'rgba(26, 26, 26, 0.95)' }}>Phone</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sticky top-0 z-10" style={{ background: 'rgba(26, 26, 26, 0.95)' }}>Package</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sticky top-0 z-10" style={{ background: 'rgba(26, 26, 26, 0.95)' }}>Domains</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sticky top-0 z-10" style={{ background: 'rgba(26, 26, 26, 0.95)' }}>Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sticky top-0 z-10" style={{ background: 'rgba(26, 26, 26, 0.95)' }}>Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sticky top-0 z-10" style={{ background: 'rgba(26, 26, 26, 0.95)' }}>Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sticky top-0 z-10" style={{ background: 'rgba(26, 26, 26, 0.95)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                      {paginatedOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-semibold text-white">{order.orderId.substring(0, 20)}...</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {order.totalAccounts} accounts
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-semibold text-white">{order.customerName}</p>
                              <p className="text-xs text-gray-400 mt-1">{order.customerEmail}</p>
                              {order.companyName && (
                                <p className="text-xs text-gray-500 mt-0.5">{order.companyName}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-300">{order.customerPhone || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 rounded-lg text-xs font-semibold" style={{
                              background: order.packageType === 'full' ? 'rgba(255, 110, 64, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                              color: order.packageType === 'full' ? '#ff8c69' : '#60a5fa'
                            }}>
                              {order.packageType === 'full' ? 'Full Package' : 'BYOD'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-white">{order.numberOfDomains} domain{order.numberOfDomains > 1 ? 's' : ''}</p>
                              {(order.selectedDomains && order.selectedDomains.length > 0) && (
                                <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                  {order.selectedDomains.join(', ')}
                                </p>
                              )}
                              {(order.customDomains && order.customDomains.length > 0) && (
                                <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                  {order.customDomains.join(', ')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-bold text-white">
                              {formatCurrency(order.amountTotal, order.currency)}
                            </p>
                            {order.paymentStatus && (
                              <p className="text-xs text-gray-400 mt-1 capitalize">
                                {order.paymentStatus}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <span
                                className="px-3 py-1 rounded-lg text-xs font-semibold capitalize"
                                style={{
                                  background: getStatusColor(order.status),
                                  color: getStatusTextColor(order.status),
                                }}
                              >
                                {order.status}
                              </span>
                              <div className="mt-2">
                                <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                                  <div
                                    className="h-full transition-all duration-300"
                                    style={{
                                      width: `${order.progressPercentage}%`,
                                      background: 'linear-gradient(to right, #ff6e40, #ff8c69)',
                                    }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{order.progressPercentage}%</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-300">{formatDate(order.createdAt)}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => openEditModal(order)}
                                className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 text-xs"
                                style={{
                                  background: 'linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)',
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDownloadCsv(order.orderId)}
                                className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 text-xs"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                }}
                              >
                                Download CSV
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {filteredOrders.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                      background: currentPage === 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
                        style={{
                          background: page === currentPage 
                            ? 'linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)'
                            : 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                      background: currentPage === totalPages ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeEditModal}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          
          {/* Modal */}
          <div
            className="relative z-10 w-full max-w-2xl rounded-3xl p-8 border"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Edit Order{' '}
                <span className="text-orange-400">{editingOrder.orderId.substring(0, 15)}...</span>
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Order Info */}
            <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-white">Customer:</span> {editingOrder.customerName}
              </p>
              <p className="text-sm text-gray-300 mt-1">
                <span className="font-semibold text-white">Email:</span> {editingOrder.customerEmail}
              </p>
            </div>

            {/* Edit Form */}
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                  style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(75, 85, 99, 1)',
                    color: '#e5e7eb',
                  }}
                >
                  <option value="in-review" className="bg-[#020617] text-white">In Review</option>
                  <option value="processing" className="bg-[#020617] text-white">Processing</option>
                  <option value="completed" className="bg-[#020617] text-white">Completed</option>
                  <option value="failed" className="bg-[#020617] text-white">Failed</option>
                  <option value="cancelled" className="bg-[#020617] text-white">Cancelled</option>
                  <option value="on-hold" className="bg-[#020617] text-white">On Hold</option>
                </select>
              </div>

              {/* Progress Percentage */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Progress Percentage: <span className="text-orange-400">{editProgress}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editProgress}
                  onChange={(e) => setEditProgress(parseInt(e.target.value))}
                  className="w-full"
                  style={{
                    accentColor: '#ff6e40',
                  }}
                />
                <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${editProgress}%`,
                      background: 'linear-gradient(to right, #ff6e40, #ff8c69)',
                    }}
                  ></div>
                </div>
              </div>

              {/* Progress Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Progress Status Message</label>
                <input
                  type="text"
                  value={editProgressStatus}
                  onChange={(e) => setEditProgressStatus(e.target.value)}
                  placeholder="e.g., Setting up domains..."
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={closeEditModal}
                disabled={isUpdating}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOrder}
                disabled={isUpdating}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)',
                }}
              >
                {isUpdating ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
